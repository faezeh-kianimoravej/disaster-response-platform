export interface Resource {
	resourceId: number;
	departmentId: number;
	name: string;
	description: string;
	quantity: number;
	available: number;
	resourceType: string;
	image: string;
}

let resources: Resource[] = [
	{
		resourceId: 1,
		departmentId: 101,
		name: 'Medical Supplies',
		description: 'First aid kits and medicines',
		quantity: 150,
		available: 120,
		resourceType: 'Medical',
		image: '/images/first-aid-box.png',
	},
	{
		resourceId: 2,
		departmentId: 102,
		name: 'Emergency Vehicles',
		description: 'Ambulances and fire trucks',
		quantity: 25,
		available: 23,
		resourceType: 'Vehicle',
		image: '/images/ambulance.png',
	},
	{
		resourceId: 3,
		departmentId: 103,
		name: 'Personnel',
		description: 'On-duty emergency staff',
		quantity: 50,
		available: 39,
		resourceType: 'Human',
		image: '/images/response.png',
	},
];

export function getResources(): Resource[] {
	return resources.slice(); // return a shallow copy
}

export function getResourceById(id: number): Resource | undefined {
	return resources.find(r => r.resourceId === id);
}

export function updateResource(updated: Resource): boolean {
	const idx = resources.findIndex(r => r.resourceId === updated.resourceId);
	if (idx === -1) return false;
	resources[idx] = { ...updated };
	return true;
}

export function deleteResource(id: number): boolean {
	const idx = resources.findIndex(r => r.resourceId === id);
	if (idx === -1) return false;
	resources.splice(idx, 1);
	return true;
}

export function addResource(newResource: Omit<Resource, 'resourceId'>): Resource {
	const nextId = resources.reduce((m, r) => Math.max(m, r.resourceId), 0) + 1;
	const resource: Resource = { resourceId: nextId, ...newResource } as Resource;
	resources.push(resource);
	return resource;
}
