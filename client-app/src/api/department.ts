//import axios from 'axios';
import type { Department, DepartmentFormData } from '@/types/department';

// Base URL
// const API_BASE = "https://url.com/api/departments";

// fake data
let departments: Department[] = [
	{
		departmentId: 1,
		municipalityId: 201,
		name: 'Fire Department',
		image: '/images/fire-department.png',
	},
	{
		departmentId: 2,
		municipalityId: 201,
		name: 'Medical Department',
		image: '/images/medical-department.png',
	},
	{
		departmentId: 3,
		municipalityId: 203,
		name: 'Police Department',
		image: '/images/police-department.png',
	},
];

export async function getDepartments(): Promise<Department[]> {
	// const response = await axios.get(API_BASE);
	// return response.data;
	return Promise.resolve(departments);
}

export async function getDepartmentById(id: number): Promise<Department | undefined> {
	// const response = await axios.get(`${API_BASE}/${id}`);
	// return response.data;
	return Promise.resolve(departments.find(d => d.departmentId === id));
}

export async function addDepartment(formData: DepartmentFormData): Promise<Department> {
	// const response = await axios.post(API_BASE, formData);
	// return response.data;
	const nextId = departments.reduce((max, d) => Math.max(max, d.departmentId), 0) + 1;
	const newDepartment: Department = { departmentId: nextId, ...formData };
	departments.push(newDepartment);
	return Promise.resolve(newDepartment);
}

export async function updateDepartment(updated: Department): Promise<Department> {
	// const response = await axios.put(`${API_BASE}/${updated.departmentId}`, updated);
	// return response.data;
	const idx = departments.findIndex(d => d.departmentId === updated.departmentId);
	if (idx !== -1) {
		departments[idx] = updated;
		return Promise.resolve(updated);
	}
	throw new Error('Department not found');
}

export async function deleteDepartment(id: number): Promise<void> {
	// await axios.delete(`${API_BASE}/${id}`);
	departments = departments.filter(d => d.departmentId !== id);
	return Promise.resolve();
}
