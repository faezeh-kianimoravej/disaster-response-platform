import { BaseApi } from '@/api/base';
import type { User, UserCreateFormData, UserEditFormData } from '@/types/user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const userApi = new BaseApi(`${API_BASE_URL}/users`);

export async function listUsers(): Promise<User[]> {
	return await userApi.get<User[]>('');
}

export async function getUser(userId: string): Promise<User> {
	return await userApi.get<User>(`/${userId}`);
}

export async function createUser(formData: UserCreateFormData): Promise<User> {
	return await userApi.post<User>('', formData);
}

export async function updateUser(formData: UserEditFormData): Promise<User> {
	return await userApi.put<User>(`/${formData.userId}`, formData);
}

export async function removeUser(userId: string): Promise<void> {
	await userApi.delete(`/${userId}`);
}

export async function login(email: string, password: string): Promise<{ token: string }> {
	return await userApi.post<{ token: string }>('login', { email, password });
}
