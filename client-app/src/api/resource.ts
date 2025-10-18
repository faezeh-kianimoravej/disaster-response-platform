import { BaseApi } from '@/api/base';
import type { Resource, ResourceFormData } from '@/types/resource';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resourceApi = new BaseApi(`${API_BASE_URL}/resources`);

export async function getResources(): Promise<Resource[]> {
	return await resourceApi.get<Resource[]>('/available');
}

export async function getResourceById(id: number): Promise<Resource> {
	return await resourceApi.get<Resource>(`/${id}`);
}

export async function addResource(formData: ResourceFormData): Promise<Resource> {
	return await resourceApi.post<Resource>('', formData);
}

export async function updateResource(updated: Resource): Promise<Resource> {
	return await resourceApi.put<Resource>(`/${updated.resourceId}`, updated);
}

export async function deleteResource(id: number): Promise<void> {
	await resourceApi.delete(`/${id}`);
}

export async function getResourcesByType(type: string): Promise<Resource[]> {
	return await resourceApi.get<Resource[]>(`/type/${type}`);
}

export async function getResourcesByDepartmentId(departmentId: number): Promise<Resource[]> {
	return await resourceApi.get<Resource[]>(`/department/${departmentId}`);
}

export async function getResourceTypes(): Promise<string[]> {
	return await resourceApi.get<string[]>('/resource-types');
}
