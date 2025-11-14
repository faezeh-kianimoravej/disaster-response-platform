import type { Role } from '@/types/role';
import type { ResponderProfile } from '@/types/responderSpecialization';

export interface User {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	roles: Role[];
	deleted: boolean;
	createdAt?: string;
	updatedAt?: string;
	passwordUpdatedAt?: string;

	// Responder profile (only if user has Responder role)
	responderProfile?: ResponderProfile;
}

export interface UserCreateFormData {
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	password: string;
	roles: Role[];
}

export interface UserEditFormData {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	password?: string;
	roles: Role[];
}

export interface LoginResponse {
	email: string;
	roles: Role[];
	token: string;
}
