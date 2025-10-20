import { BaseApi } from '@/api/base';
import type { Department, DepartmentFormData } from '@/types/department';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const departmentApi = new BaseApi(`${API_BASE_URL}/departments`);

export async function getDepartments(): Promise<Department[]> {
	return await departmentApi.get<Department[]>('');
}

export async function getDepartmentsByMunicipalityId(
	municipalityId: number
): Promise<Department[]> {
	return await departmentApi.get<Department[]>(`/municipality/${municipalityId}`);
}

export async function getDepartmentById(id: number): Promise<Department> {
	return await departmentApi.get<Department>(`/${id}`);
}

export async function addDepartment(formData: DepartmentFormData): Promise<Department> {
	return await departmentApi.post<Department>('', formData);
}

export async function updateDepartment(updated: Department): Promise<Department> {
	return await departmentApi.put<Department>(`/${updated.departmentId}`, updated);
}

export async function deleteDepartment(id: number): Promise<void> {
	return await departmentApi.delete(`/${id}`);
}
