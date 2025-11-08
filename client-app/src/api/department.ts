import { BaseApi } from '@/api/base';
import type { Department, ResourceSummary } from '@/types/department';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const departmentApi = new BaseApi(`${API_BASE_URL}/departments`);

type ApiResourceSummary = {
	resourceId: number | string;
	name: string;
	image: string;
};

type ApiDepartment = {
	departmentId: number | string;
	municipalityId: number | string;
	name: string;
	image: string;
	resources?: ApiResourceSummary[];
};

function fromApiDepartment(a: ApiDepartment): Department {
	return {
		departmentId: Number(a.departmentId),
		municipalityId: Number(a.municipalityId),
		name: a.name,
		image: a.image,
		resources: a.resources?.map(r => ({
			resourceId: Number(r.resourceId),
			name: r.name,
			image: r.image,
		})) as ResourceSummary[] | undefined,
	} as Department;
}

function fromApiDepartments(list: ApiDepartment[]): Department[] {
	return list.map(fromApiDepartment);
}

export async function getAllDepartments(): Promise<Department[]> {
	const data = await departmentApi.get<Department[]>('');
	return fromApiDepartments(data);
}

export async function getDepartmentsByMunicipalityId(
	municipalityId: number
): Promise<Department[]> {
	const data = await departmentApi.get<ApiDepartment[]>(`/municipality/${municipalityId}`);
	return fromApiDepartments(data);
}

export async function getDepartmentById(id: number): Promise<Department> {
	const data = await departmentApi.get<ApiDepartment>(`/${id}`);
	return fromApiDepartment(data);
}

export async function addDepartment(formData: Department): Promise<Department> {
	const created = await departmentApi.post<ApiDepartment>('', formData);
	return fromApiDepartment(created);
}

export async function updateDepartment(updated: Department): Promise<Department> {
	const updatedApi = await departmentApi.put<ApiDepartment>(`/${updated.departmentId}`, updated);
	return fromApiDepartment(updatedApi);
}

export async function deleteDepartment(id: number): Promise<void> {
	return await departmentApi.delete(`/${id}`);
}
