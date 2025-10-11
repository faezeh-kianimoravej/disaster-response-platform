// import { BaseApi } from './base';
import type { Resource, ResourceFormData } from '@/types/resource';

// const resourceApi = new BaseApi('/api/resources');

const fakeResources: Resource[] = [
	{
		resourceId: 1,
		departmentId: 1,
		name: 'Medical Supplies',
		description: 'First aid kits and emergency medicines',
		quantity: 150,
		available: 120,
		resourceType: 'Medical',
		image: '/images/first-aid-box.png',
	},
	{
		resourceId: 2,
		departmentId: 1,
		name: 'Ambulance Vehicle',
		description: 'Emergency response ambulance with full medical equipment',
		quantity: 5,
		available: 3,
		resourceType: 'Vehicle',
		image: '/images/ambulance.png',
	},
	{
		resourceId: 3,
		departmentId: 2,
		name: 'Fire Truck',
		description: 'Heavy-duty fire fighting vehicle with ladder and hoses',
		quantity: 8,
		available: 6,
		resourceType: 'Vehicle',
		image: '/images/fire-truck.png',
	},
	{
		resourceId: 4,
		departmentId: 2,
		name: 'Fire Extinguishers',
		description: 'Portable fire extinguishers for various fire types',
		quantity: 200,
		available: 180,
		resourceType: 'Equipment',
		image: '/images/fire-extinguisher.png',
	},
	{
		resourceId: 5,
		departmentId: 3,
		name: 'Police Patrol Cars',
		description: 'Standard patrol vehicles for community policing',
		quantity: 25,
		available: 20,
		resourceType: 'Vehicle',
		image: '/images/police-car.png',
	},
	{
		resourceId: 6,
		departmentId: 3,
		name: 'Communication Equipment',
		description: 'Two-way radios and communication devices',
		quantity: 100,
		available: 85,
		resourceType: 'Equipment',
		image: '/images/radio-equipment.png',
	},
	{
		resourceId: 7,
		departmentId: 1,
		name: 'Defibrillators',
		description: 'Automated external defibrillators for cardiac emergencies',
		quantity: 15,
		available: 12,
		resourceType: 'Medical',
		image: '/images/defibrillator.png',
	},
	{
		resourceId: 8,
		departmentId: 2,
		name: 'Protective Gear',
		description: 'Firefighter helmets, suits and breathing apparatus',
		quantity: 50,
		available: 35,
		resourceType: 'Equipment',
		image: '/images/firefighter-gear.png',
	},
];

export async function getResources(): Promise<Resource[]> {
	return Promise.resolve(fakeResources);
}

export async function getResourceById(id: number): Promise<Resource | undefined> {
	return Promise.resolve(fakeResources.find(r => r.resourceId === id));
}

export async function addResource(formData: ResourceFormData): Promise<Resource> {
	const nextId = fakeResources.reduce((max, r) => Math.max(max, r.resourceId), 0) + 1;
	const newResource: Resource = { resourceId: nextId, ...formData };
	fakeResources.push(newResource);
	return Promise.resolve(newResource);
}

export async function updateResource(updated: Resource): Promise<Resource> {
	const idx = fakeResources.findIndex(r => r.resourceId === updated.resourceId);
	if (idx !== -1) {
		fakeResources[idx] = updated;
		return Promise.resolve(updated);
	}
	throw new Error('Resource not found');
}

export async function deleteResource(id: number): Promise<void> {
	const idx = fakeResources.findIndex(r => r.resourceId === id);
	if (idx !== -1) {
		fakeResources.splice(idx, 1);
		return Promise.resolve();
	}
	throw new Error('Resource not found');
}
