// import { BaseApi } from './base';
import type { Department, DepartmentFormData } from '@/types/department';

// Create department API instance (ready for production use)
// const departmentApi = new BaseApi('/api/departments');

// fake data for development
const fakeDepartments: Department[] = [
	{
		departmentId: 1,
		municipalityId: 301,
		name: 'Emergency Medical Services',
		description: 'Emergency medical response and ambulance services',
		contactInfo: '+1 (555) 123-4567',
		image: '/images/medical-department.png',
		capacity: 100,
		currentStaff: 75,
	},
	{
		departmentId: 2,
		municipalityId: 301,
		name: 'Fire Department',
		description: 'Fire suppression and rescue operations',
		contactInfo: '+1 (555) 234-5678',
		image: '/images/fire-department.png',
		capacity: 120,
		currentStaff: 95,
	},
	{
		departmentId: 3,
		municipalityId: 301,
		name: 'Police Department',
		description: 'Law enforcement and community safety',
		contactInfo: '+1 (555) 345-6789',
		image: '/images/police-department.png',
		capacity: 200,
		currentStaff: 165,
	},
	{
		departmentId: 4,
		municipalityId: 302,
		name: 'Emergency Management',
		description: 'Disaster response coordination and preparedness',
		contactInfo: '+1 (555) 456-7890',
		image: '/images/emergency-management.png',
		capacity: 50,
		currentStaff: 35,
	},
	{
		departmentId: 5,
		municipalityId: 302,
		name: 'Search and Rescue',
		description: 'Wilderness and urban search and rescue operations',
		contactInfo: '+1 (555) 567-8901',
		image: '/images/search-rescue.png',
		capacity: 40,
		currentStaff: 28,
	},
];

export async function getDepartments(): Promise<Department[]> {
	// In production: return departmentApi.get<Department[]>();
	return Promise.resolve(fakeDepartments);
}

export async function getDepartmentById(id: number): Promise<Department | undefined> {
	// In production: return departmentApi.get<Department>(`/${id}`);
	return Promise.resolve(fakeDepartments.find(d => d.departmentId === id));
}

export async function addDepartment(formData: DepartmentFormData): Promise<Department> {
	// In production: return departmentApi.post<Department>('', formData);
	const nextId = fakeDepartments.reduce((max, d) => Math.max(max, d.departmentId), 0) + 1;
	const newDepartment: Department = { departmentId: nextId, ...formData };
	fakeDepartments.push(newDepartment);
	return Promise.resolve(newDepartment);
}

export async function updateDepartment(updated: Department): Promise<Department> {
	// In production: return departmentApi.put<Department>(`/${updated.departmentId}`, updated);
	const idx = fakeDepartments.findIndex(d => d.departmentId === updated.departmentId);
	if (idx !== -1) {
		fakeDepartments[idx] = updated;
		return Promise.resolve(updated);
	}
	throw new Error('Department not found');
}

export async function deleteDepartment(id: number): Promise<void> {
	// In production: return departmentApi.delete(`/${id}`);
	const idx = fakeDepartments.findIndex(d => d.departmentId === id);
	if (idx !== -1) {
		fakeDepartments.splice(idx, 1);
		return Promise.resolve();
	}
	throw new Error('Department not found');
}
