import { BaseApi } from '@/api/base';
import type { Resource, ResourceFormData, ResourceSearchResult } from '@/types/resource';
import { RESOURCE_TYPES } from '@/utils/resourceUtils';
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
	incidentId: number,
	resourceType: string,
	departmentId: string,
	municipalityId: string
): Promise<ResourceSearchResult[]> {
	const params = new URLSearchParams();
	const mappedType =
		Object.keys(RESOURCE_TYPES).find(
			key => RESOURCE_TYPES[key as keyof typeof RESOURCE_TYPES] === resourceType
		) || resourceType;

	if (mappedType && mappedType !== 'All') params.append('resourceType', mappedType);
	if (departmentId && departmentId !== 'All') params.append('departmentId', departmentId);
	if (municipalityId && municipalityId !== 'All') params.append('municipalityId', municipalityId);
	if (incidentId) params.append('incidentId', incidentId.toString());

	const queryString = params.toString() ? `?${params.toString()}` : '';
	return await resourceApi.get<ResourceSearchResult[]>(`/available/nearest${queryString}`);
}
