import { BaseApi } from '@/api/base';
import type { Resource, ResourceFormData, ResourceSearchResult } from '@/types/resource';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resourceApi = new BaseApi(`${API_BASE_URL}/resources`);

type ApiResource = {
	resourceId: number | string;
	departmentId: number | string;
	name: string;
	description?: string | null;
	quantity: number | string;
	available: number | string;
	resourceType: string;
	latitude?: number;
	longitude?: number;
	image?: string;
};

function fromApiResource(a: ApiResource): Resource {
	return {
		resourceId: Number(a.resourceId),
		departmentId: Number(a.departmentId),
		name: a.name,
		description: a.description ?? undefined,
		quantity: Number(a.quantity),
		available: Number(a.available),
		resourceType: a.resourceType,
		latitude: a.latitude,
		longitude: a.longitude,
		image: a.image,
	} as Resource;
}

function fromApiResources(list: ApiResource[]): Resource[] {
	return list.map(fromApiResource);
}

export async function getResourcesByDepartmentId(departmentId: number): Promise<Resource[]> {
	const data = await resourceApi.get<ApiResource[]>(`/department/${departmentId}`);
	return fromApiResources(data);
}

export async function getResourceTypes(): Promise<Record<string, string>> {
	return await resourceApi.get<Record<string, string>>('/resource-types');
}

export async function getResourceById(id: number): Promise<Resource> {
	const data = await resourceApi.get<ApiResource>(`/${id}`);
	return fromApiResource(data);
}

export async function addResource(formData: ResourceFormData): Promise<Resource> {
	const created = await resourceApi.post<ApiResource>('', formData);
	return fromApiResource(created);
}

export async function updateResource(updated: Resource): Promise<Resource> {
	const updatedApi = await resourceApi.put<ApiResource>(`/${updated.resourceId}`, updated);
	return fromApiResource(updatedApi);
}

export async function deleteResource(id: number): Promise<void> {
	await resourceApi.delete(`/${id}`);
}

export async function getResourcesByType(type: string): Promise<Resource[]> {
	return await resourceApi.get<Resource[]>(`/type/${type}`);
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
