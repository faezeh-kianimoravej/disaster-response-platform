import { BaseApi } from '@/api/base';
import type { Resource, ResourceFormData, ResourceSearchResult } from '@/types/resource';

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

export async function searchResources(
	resourceType: string,
	departmentId: string,
	municipalityId: string
): Promise<ResourceSearchResult[]> {
	const params = new URLSearchParams();

	if (resourceType && resourceType !== 'All') params.append('resourceType', resourceType);
	if (departmentId && departmentId !== 'All') params.append('departmentId', departmentId);
	if (municipalityId && municipalityId !== 'All') params.append('municipalityId', municipalityId);

	//const queryString = params.toString() ? `?${params.toString()}` : '';
	//return await resourceApi.get<ResourceSearchResult[]>(`/search${queryString}`);

	// FAKE DATA FOR TESTING
	return [
		{
			resourceId: 1,
			resourceType: 'Fire Truck',
			department: 'Fire Department Deventer',
			municipality: 'Deventer',
			available: 2,
			distance: '2.1 km',
		},
		{
			resourceId: 2,
			resourceType: 'Ambulance',
			department: 'Medical Department Enschede',
			municipality: 'Enschede',
			available: 1,
			distance: '3.7 km',
		},
		{
			resourceId: 3,
			resourceType: 'Police Car',
			department: 'Police Department Deventer',
			municipality: 'Deventer',
			available: 4,
			distance: '7.5 km',
		},
		{
			resourceId: 4,
			resourceType: 'Rescue Boat',
			department: 'Fire Department Deventer',
			municipality: 'Enschede',
			available: 1,
			distance: '12.3 km',
		},
	];
}
