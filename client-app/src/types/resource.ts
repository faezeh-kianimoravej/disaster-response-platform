export const RESOURCE_CATEGORIES = ['VEHICLE', 'EQUIPMENT', 'CONSUMABLE'] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_STATUSES = [
	'AVAILABLE',
	'DEPLOYED',
	'MAINTENANCE',
	'OUT_OF_SERVICE',
] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export const RESOURCE_TYPES = [
	// General
	'COMMAND_VEHICLE',
	'TEAM',
	'BOAT',
	'HELICOPTER',
	'DRONE',

	// Fire
	'FIRE_TRUCK',
	'LADDER_TRUCK',

	// Medical
	'AMBULANCE',
	'TRAUMA_HELICOPTER',

	// Police
	'PATROL_CAR',
	'SWAT_CAR',

	// Army
	'ARMORED_VEHICLE',
	'TRANSPORT_TRUCK',

	// Specialized
	'RESCUE_VEHICLE',
	'WATER_TANKER',
	'HAZMAT_VEHICLE',
	'COASTGUARD_VESSEL',

	// EQUIPMENT
	'DEFIBRILLATOR',
	'GENERATOR',

	// CONSUMABLEs
	'WATER_BOTTLE',
	'MEDICAL_KIT',
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_CATEGORY: Record<ResourceType, ResourceCategory> = {
	COMMAND_VEHICLE: 'VEHICLE',
	TEAM: 'VEHICLE',
	BOAT: 'VEHICLE',
	HELICOPTER: 'VEHICLE',
	DRONE: 'VEHICLE',
	FIRE_TRUCK: 'VEHICLE',
	LADDER_TRUCK: 'VEHICLE',
	AMBULANCE: 'VEHICLE',
	TRAUMA_HELICOPTER: 'VEHICLE',
	PATROL_CAR: 'VEHICLE',
	SWAT_CAR: 'VEHICLE',
	ARMORED_VEHICLE: 'VEHICLE',
	TRANSPORT_TRUCK: 'VEHICLE',
	RESCUE_VEHICLE: 'VEHICLE',
	WATER_TANKER: 'VEHICLE',
	HAZMAT_VEHICLE: 'VEHICLE',
	COASTGUARD_VESSEL: 'VEHICLE',
	DEFIBRILLATOR: 'EQUIPMENT',
	GENERATOR: 'EQUIPMENT',
	WATER_BOTTLE: 'CONSUMABLE',
	MEDICAL_KIT: 'CONSUMABLE',
};

export type ResourceKind = 'UNIQUE' | 'STACKABLE' | 'CONSUMABLE';

export interface Resource {
	resourceId: number;
	departmentId: number;
	name: string;
	description?: string;
	category: ResourceCategory;
	resourceType: ResourceType;
	resourceKind: ResourceKind;

	status: ResourceStatus;

	totalQuantity?: number;
	availableQuantity?: number;
	unit?: 'PIECES' | 'LITERS' | 'SETS' | 'UNITS';

	isTrackable: boolean;
	latitude?: number;
	longitude?: number;
	lastLocationUpdate?: Date;

	currentDeploymentId?: number;
	deployedQuantity?: number;

	image?: string;
}

export interface ResourceFormData {
	name: string;
	description?: string | null;
	category: ResourceCategory;
	resourceType: ResourceType;
	resourceKind: ResourceKind;
	departmentId: number;
	totalQuantity?: number;
	availableQuantity?: number;
	unit?: string;
	isTrackable: boolean;
	image?: string;
}
