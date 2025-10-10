import type { Department, DepartmentFormData } from './types';

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

// Get all departments
export async function getDepartments(): Promise<Department[]> {
	// const response = await axios.get("/api/departments");
	// return response.data;
	return departments;
}

// Get department by ID
export async function getDepartmentById(id: number): Promise<Department | undefined> {
	// const response = await axios.get(`/api/departments/${id}`);
	// return response.data;
	return departments.find(d => d.departmentId === id);
}

// Add a new department
export async function addDepartment(formData: DepartmentFormData): Promise<Department> {
	// const response = await axios.post("/api/departments", formData);
	// return response.data;
	const nextId = departments.reduce((max, d) => Math.max(max, d.departmentId), 0) + 1;
	const newDepartment: Department = { departmentId: nextId, ...formData };
	departments.push(newDepartment);
	return newDepartment;
}

// Update an existing department
export async function updateDepartment(updated: Department): Promise<Department> {
	// const response = await axios.put(`/api/departments/${updated.departmentId}`, updated);
	// return response.data;
	const idx = departments.findIndex(d => d.departmentId === updated.departmentId);
	if (idx !== -1) {
		departments[idx] = { ...updated };
	}
	return updated;
}

// Delete a department
export async function deleteDepartment(id: number): Promise<boolean> {
	// await axios.delete(`/api/departments/${id}`);
	const idx = departments.findIndex(d => d.departmentId === id);
	if (idx === -1) return false;
	departments.splice(idx, 1);
	return true;
}

//  Get departments by municipality
export async function getDepartmentsByMunicipality(municipalityId: number): Promise<Department[]> {
	// const response = await axios.get(`/api/municipalities/${municipalityId}/departments`);
	// return response.data;
	return departments.filter(d => d.municipalityId === municipalityId);
}
