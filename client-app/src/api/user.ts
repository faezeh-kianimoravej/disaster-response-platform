import { BaseApi } from '@/api/base';
import type { User, UserCreateFormData, UserEditFormData, LoginResponse } from '@/types/user';
import type { Role } from '@/types/role';
import type { ResponderProfile } from '@/types/responderSpecialization';
import type { ResponderSpecialization } from '@/types/responderSpecialization';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const userApi = new BaseApi(`${API_BASE_URL}/users`);

// Backend responder profile structure (ResponderProfileDto)
type ApiResponderProfile = {
	id?: number | undefined;
	userId: number;
	departmentId: number;
	primarySpecialization: string;
	secondarySpecializations?: string[];
	isAvailable: boolean;
	currentDeploymentId?: number;
};

function normalizeSpecialization(value: string | undefined | null): string | undefined {
	if (value === undefined || value === null) return undefined;
	// Convert to uppercase and replace non-alphanumeric runs with underscore
	return String(value)
		.toUpperCase()
		.replace(/[^A-Z0-9]+/gi, '_');
}

// Backend response structure (UserResponseDto)
type ApiUser = {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	roles: Role[];
	deleted: boolean;
	createdAt?: string;
	updatedAt?: string;
	passwordUpdatedAt?: string;
	responderProfile?: ApiResponderProfile;
};

// Backend request structure (UserRequestDto)
type ApiUserRequest = {
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	password?: string;
	roles: Role[];
	responderProfile?: ApiResponderProfile;
};

// Convert from backend UserResponseDto to frontend User
function fromApiUser(a: ApiUser): User {
	const user: User = {
		userId: a.id,
		firstName: a.firstName,
		lastName: a.lastName,
		email: a.email,
		mobile: a.mobile,
		roles: a.roles,
		deleted: a.deleted,
	};

	if (a.createdAt) user.createdAt = a.createdAt;
	if (a.updatedAt) user.updatedAt = a.updatedAt;
	if (a.passwordUpdatedAt) user.passwordUpdatedAt = a.passwordUpdatedAt;
	const apiProfile = (a as { responderProfile?: ApiResponderProfile }).responderProfile;
	function denormalizeSpecialization(value: string | undefined | null): string | undefined {
		if (value === undefined || value === null) return undefined;
		return String(value).toLowerCase();
	}

	if (apiProfile) {
		const responderProfile: ResponderProfile = {
			id: apiProfile.id,
			userId: apiProfile.userId,
			departmentId: apiProfile.departmentId,
			primarySpecialization: denormalizeSpecialization(
				apiProfile.primarySpecialization
			) as ResponderSpecialization,
			isAvailable: apiProfile.isAvailable,
		};
		if (apiProfile.secondarySpecializations) {
			responderProfile.secondarySpecializations = apiProfile.secondarySpecializations.map(
				denormalizeSpecialization
			) as ResponderSpecialization[];
		}
		if (typeof apiProfile.currentDeploymentId === 'number') {
			responderProfile.currentDeploymentId = apiProfile.currentDeploymentId;
		}
		user.responderProfile = responderProfile;
	}
	return user;
}

function fromApiUsers(list: ApiUser[]): User[] {
	return list.map(fromApiUser);
}

// Convert from frontend form data to backend UserRequestDto
function toApiUserRequest(formData: UserCreateFormData | UserEditFormData): ApiUserRequest {
	const req: ApiUserRequest = {
		firstName: formData.firstName,
		lastName: formData.lastName,
		email: formData.email,
		mobile: formData.mobile,
		roles: formData.roles,
	};

	// Only include password if provided and non-empty
	if (typeof (formData as UserEditFormData).password === 'string') {
		const pwd = (formData as UserEditFormData).password;
		if (pwd && pwd.trim().length > 0) {
			req.password = pwd;
		}
	} else if ((formData as UserCreateFormData).password) {
		req.password = (formData as UserCreateFormData).password;
	}

	const maybeProfile = (
		formData as unknown as {
			responderProfile?: {
				id?: number | null;
				userId?: number | null;
				departmentId?: number | null;
				primarySpecialization?: string;
				secondarySpecializations?: string[];
				isAvailable?: boolean;
				currentDeploymentId?: number | null;
			};
		}
	).responderProfile;
	if (maybeProfile) {
		const profile: ApiResponderProfile = {
			id: typeof maybeProfile.id === 'number' ? (maybeProfile.id as number) : undefined,
			userId: maybeProfile.userId as unknown as number,
			departmentId: maybeProfile.departmentId as unknown as number,
			primarySpecialization: normalizeSpecialization(maybeProfile.primarySpecialization) ?? '',
			isAvailable: Boolean(maybeProfile.isAvailable),
		};
		if (maybeProfile.secondarySpecializations && maybeProfile.secondarySpecializations.length > 0) {
			profile.secondarySpecializations = maybeProfile.secondarySpecializations
				.map(normalizeSpecialization)
				.filter((v): v is string => typeof v === 'string');
		}
		if (typeof maybeProfile.currentDeploymentId === 'number') {
			profile.currentDeploymentId = maybeProfile.currentDeploymentId as number;
		}
		req.responderProfile = profile;
	}

	return req;
}

export async function listUsers(): Promise<User[]> {
	const data = await userApi.get<ApiUser[]>('');
	return fromApiUsers(data);
}

export async function getUser(userId: string | number): Promise<User> {
	const data = await userApi.get<ApiUser>(`/${userId}`);
	return fromApiUser(data);
}

export async function getUserByEmail(email: string): Promise<User> {
	const encoded = encodeURIComponent(email);
	const data = await userApi.get<ApiUser>(`/by-email/${encoded}`);
	return fromApiUser(data);
}

export async function createUser(formData: UserCreateFormData): Promise<User> {
	const requestData = toApiUserRequest(formData);
	const created = await userApi.post<ApiUser>('', requestData);
	return fromApiUser(created);
}

export async function updateUser(formData: UserEditFormData): Promise<User> {
	const requestData = toApiUserRequest(formData);
	const updated = await userApi.put<ApiUser>(`/${formData.userId}`, requestData);
	return fromApiUser(updated);
}

export async function removeUser(userId: string | number): Promise<void> {
	await userApi.delete(`/${userId}`);
}

export async function login(email: string, password: string): Promise<LoginResponse> {
	const response = await userApi.post<LoginResponse>('/login', { email, password });
	return response;
}

export async function getUsersByRegion(regionId: number): Promise<User[]> {
	const data = await userApi.get<ApiUser[]>(`/by-region/${regionId}`);
	return fromApiUsers(data);
}

export async function getUsersByMunicipality(municipalityId: number): Promise<User[]> {
	const data = await userApi.get<ApiUser[]>(`/by-municipality/${municipalityId}`);
	return fromApiUsers(data);
}

export async function getUsersByDepartment(departmentId: number): Promise<User[]> {
	const data = await userApi.get<ApiUser[]>(`/by-department/${departmentId}`);
	return fromApiUsers(data);
}
