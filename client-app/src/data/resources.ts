import type { ValidationResult } from '@/utils/validation';
import { createValidationRule, validateRequired, validateMinValue } from '@/utils/validation';

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

export interface ResourceFormData {
	name: string;
	description: string;
	quantity: number;
	available: number;
	resourceType: string;
	departmentId: number;
	image: string;
}

// Fields that actually need validation
type ResourceValidationFields = Pick<
	ResourceFormData,
	'name' | 'quantity' | 'available' | 'departmentId' | 'image'
>;

// Simplified validation - only validate fields that need it
export function validateResource(
	data: ResourceFormData
): ValidationResult<ResourceValidationFields> {
	return {
		name: validateRequired(data.name, 'Resource name'),
		quantity: validateMinValue(data.quantity, 1, 'Quantity'),
		available: createValidationRule(
			data.available >= 0 && data.available <= data.quantity,
			'Available must be between 0 and quantity'
		),
		departmentId: validateMinValue(data.departmentId, 1, 'Department ID'),
		image: validateRequired(data.image, 'Image'),
	};
}

export const RESOURCE_TYPES = {
	Medical: 'Medical',
	Vehicle: 'Vehicle',
	Human: 'Human',
} as const;

export type ResourceType = keyof typeof RESOURCE_TYPES;

export const RESOURCE_TYPE_IMAGES: Record<ResourceType, string> = {
	Medical: '/images/first-aid-box.png',
	Vehicle: '/images/ambulance.png',
	Human: '/images/response.png',
};

export function getImageForResourceType(resourceType: string): string {
	return RESOURCE_TYPE_IMAGES[resourceType as ResourceType] || RESOURCE_TYPE_IMAGES.Medical;
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
