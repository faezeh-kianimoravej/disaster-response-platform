export const RESOURCE_CATEGORIES = ['vehicle', 'equipment', 'consumable'] as const;
export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export const RESOURCE_STATUSES = [
	'available',
	'deployed',
	'maintenance',
	'out_of_service',
] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface Resource {
	resourceId: number;
	departmentId: number;
	name: string;
	description?: string;
	category: ResourceCategory;
	resourceType: string;

	status: ResourceStatus;

	totalQuantity?: number;
	availableQuantity?: number;
	unit?: 'pieces' | 'liters' | 'sets' | 'units';

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
	resourceType: string;
	departmentId: number;
	totalQuantity?: number;
	availableQuantity?: number;
	unit?: string;
	isTrackable: boolean;
	image?: string;
}
