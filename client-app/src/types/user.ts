import type { Role } from './role';

export interface User {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	roles: Role[];
	departmentId: number | undefined;
	municipalityId: number | undefined;
	regionId: number | undefined;
}

export interface UserCreateFormData {
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	password: string;
	roles: Role[];
	departmentId?: number | undefined;
	municipalityId?: number | undefined;
	regionId?: number | undefined;
}

export interface UserEditFormData extends UserCreateFormData {
	userId: number;
}
