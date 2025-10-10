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

