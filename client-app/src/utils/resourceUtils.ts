export const RESOURCE_TYPES = {
	FIELD_OPERATOR: 'Field Operator',
	TRANSPORT_VEHICLE: 'Transport Vehicle',
	FIRE_TRUCK: 'Fire Truck',
	AMBULANCE: 'Ambulance',
	RIOT_CAR: 'Riot Car',
} as const;

export type ResourceType = keyof typeof RESOURCE_TYPES;

export const RESOURCE_TYPE_IMAGES: Record<ResourceType, string> = {
	FIELD_OPERATOR: '/images/fieldoperator.png',
	TRANSPORT_VEHICLE: '/images/transportvehicle.png',
	FIRE_TRUCK: '/images/firetruck.png',
	AMBULANCE: '/images/ambulance.png',
	RIOT_CAR: '/images/riotcar.png',
};

export function getImageForResourceType(resourceType: string): string {
	return RESOURCE_TYPE_IMAGES[resourceType as ResourceType] || RESOURCE_TYPE_IMAGES.FIELD_OPERATOR;
}
