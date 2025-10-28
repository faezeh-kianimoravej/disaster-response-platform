import { useState, useCallback } from 'react';
import type { User, UserCreateFormData, UserEditFormData } from '@/types/user';
import { createUser, updateUser, getUser, listUsers, removeUser } from '@/api/user';
import { validateUserForm } from '@/validation/userValidation';
import type { ApiError } from '@/api/base';
import { mergeBackendValidation } from '@/utils/mergeBackendValidation';

function useUserForm<T extends UserCreateFormData | UserEditFormData, R extends User>(
	apiCall: (formData: T) => Promise<R>
) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validation, setValidation] = useState<ReturnType<typeof validateUserForm> | null>(null);
	const [user, setUser] = useState<User | null>(null);

	async function submit(formData: T) {
		setLoading(true);
		setError(null);
		setValidation(null);
		const frontendValidation = validateUserForm(formData);
		const hasFrontendError = Object.values(frontendValidation).some(v => !v.isValid);
		if (hasFrontendError) {
			setValidation(frontendValidation);
			setLoading(false);
			return false;
		}
		try {
			const result = await apiCall(formData);
			setUser(result);
			setLoading(false);
			return true;
		} catch (err) {
			const apiError = err as ApiError;
			if (apiError.validationErrors) {
				setValidation(mergeBackendValidation(frontendValidation, apiError));
			} else {
				setError(apiError.message);
			}
			setLoading(false);
			return false;
		}
	}

	return { submit, loading, error, validation, user };
}

export function useCreateUser() {
	return useUserForm<UserCreateFormData, User>(createUser);
}

export function useUpdateUser() {
	return useUserForm<UserEditFormData, User>(updateUser);
}

export function useGetUser() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);

	const fetchUser = useCallback(async (userId: string | number) => {
		setLoading(true);
		setError(null);
		try {
			await new Promise(res => setTimeout(res, 200)); // simulate network delay
			const found = FAKE_USERS.find(u => u.userId === Number(userId));
			setUser(found ?? null);
			setLoading(false);
			return found ?? null;
		} catch (err) {
			setError((err as Error).message);
			setLoading(false);
			return null;
		}
	}, []);

	return { fetchUser, loading, error, user };
}

// --- FAKE USERS FOR TESTING ---
const FAKE_USERS: User[] = [
	{
		userId: 1,
		firstName: 'Alice',
		lastName: 'Admin',
		email: 'alice.admin@example.com',
		mobile: '1234567890',
		roles: ['Region Admin'],
		regionId: 1,
		departmentId: undefined,
		municipalityId: undefined,
	},
	{
		userId: 2,
		firstName: 'Bob',
		lastName: 'Manager',
		email: 'bob.manager@example.com',
		mobile: '2345678901',
		roles: ['Municipality Admin'],
		regionId: undefined,
		departmentId: undefined,
		municipalityId: 1,
	},
	{
		userId: 3,
		firstName: 'Carol',
		lastName: 'User',
		email: 'carol.user@example.com',
		mobile: '3456789012',
		roles: ['Department Admin'],
		regionId: undefined,
		departmentId: 1,
		municipalityId: undefined,
	},
	{
		userId: 4,
		firstName: 'David',
		lastName: 'Citizen',
		email: 'david.citizen@example.com',
		mobile: '4567890123',
		roles: ['Citizen'],
		regionId: undefined,
		departmentId: undefined,
		municipalityId: undefined,
	},
	{
		userId: 5,
		firstName: 'Eva',
		lastName: 'Responder',
		email: 'eva.responder@example.com',
		mobile: '5678901234',
		roles: ['Responder', 'Officer on Duty'],
		regionId: undefined,
		departmentId: 2,
		municipalityId: undefined,
	},
];

// --- END FAKE USERS ---

export function useListUsers() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [users, setUsers] = useState<User[]>([]);

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			await new Promise(res => setTimeout(res, 300)); // simulate network delay
			setUsers(FAKE_USERS);
			setLoading(false);
			return FAKE_USERS;
		} catch (err) {
			setError((err as Error).message);
			setLoading(false);
			return [];
		}
	}, []);

	return { fetchUsers, loading, error, users };
}

export function useRemoveUser() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	async function remove(userId: string) {
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			await removeUser(userId);
			setSuccess(true);
			setLoading(false);
			return true;
		} catch (err) {
			setError((err as Error).message);
			setLoading(false);
			return false;
		}
	}

	return { remove, loading, error, success };
}
