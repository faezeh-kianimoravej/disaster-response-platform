import { BaseApi } from '@/api/base';
import type { Resource, ResourceFormData, ResourceStatus } from '@/types/resource';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const resourceApi = new BaseApi(`${API_BASE_URL}/resources`);

type ApiResource = {
	resourceId: number | string;
	departmentId: number | string;
	name: string;
	description?: string | null;
	category: string;
	resourceType: string;
	resourceKind: string;
	status: string;
	totalQuantity?: number | string | null;
	availableQuantity?: number | string | null;
	unit?: string | null;
	isTrackable: boolean;
	latitude?: number | null;
	longitude?: number | null;
	lastLocationUpdate?: string | null;
	currentDeploymentId?: number | null;
	deployedQuantity?: number | string | null;
	image?: string | null;
};

function fromApiResource(a: ApiResource): Resource {
	const allowedUnits = ['PIECES', 'LITERS', 'SETS', 'UNITS'] as const;
	function isAllowedUnit(val: unknown): val is Resource['unit'] {
		return typeof val === 'string' && (allowedUnits as readonly string[]).includes(val);
	}
	const unit = isAllowedUnit(a.unit) ? a.unit : undefined;
	return {
		resourceId: Number(a.resourceId),
		departmentId: Number(a.departmentId),
		name: a.name,
		category: a.category as Resource['category'],
		resourceType: a.resourceType as Resource['resourceType'],
		resourceKind: a.resourceKind as Resource['resourceKind'],
		status: a.status as Resource['status'],
		isTrackable: Boolean(a.isTrackable),
		...(a.description != null ? { description: a.description } : {}),
		...(a.totalQuantity != null ? { totalQuantity: Number(a.totalQuantity) } : {}),
		...(a.availableQuantity != null ? { availableQuantity: Number(a.availableQuantity) } : {}),
		...(unit ? { unit } : {}),
		...(a.latitude != null ? { latitude: a.latitude } : {}),
		...(a.longitude != null ? { longitude: a.longitude } : {}),
		...(a.lastLocationUpdate ? { lastLocationUpdate: new Date(a.lastLocationUpdate) } : {}),
		...(a.currentDeploymentId != null ? { currentDeploymentId: a.currentDeploymentId } : {}),
		...(a.deployedQuantity != null ? { deployedQuantity: Number(a.deployedQuantity) } : {}),
		...(a.image != null ? { image: a.image } : {}),
	};
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

export async function addResource(
	formData: ResourceFormData,
	status?: ResourceStatus
): Promise<Resource> {
	// Include status in payload if provided
	const payload = status ? { ...formData, status } : formData;
	const created = await resourceApi.post<ApiResource>('', payload);
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
