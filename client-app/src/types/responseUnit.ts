import { ResourceStatus } from '@/types/resource';
import { ResponderSpecialization } from '@/types/responderSpecialization';

export const RESPONSE_UNIT_TYPES = [
	// General
	'Command vehicle',
	'Team',
	'Boat',
	'Helicopter',
	'Drone',

	// Fire
	'Fire truck',
	'Ladder truck',

	// Medical
	'Ambulance',
	'Trauma helicopter',

	// Police
	'Patrol car',
	'SWAT car',

	// Army
	'Armored vehicle',
	'Transport truck',

	// Specialized
	'Rescue vehicle',
	'Water tanker',
	'Hazmat vehicle',
	'Coastguard vessel',

	// Other
	'Other',
] as const;

export type ResponseUnitType = (typeof RESPONSE_UNIT_TYPES)[number];

export interface ResponseUnit {
	unitId: number;
	unitName: string;
	departmentId: number;
	unitType: ResponseUnitType;

	// Pre-configured default composition (template/standard setup)
	defaultResources: {
		resourceId: number;
		quantity: number;
		isPrimary: boolean; // e.g., fire truck is primary, hoses are secondary
	}[];

	defaultPersonnel: {
		userId?: number; // Optional - can be a "slot" if not assigned yet
		specialization: ResponderSpecialization;
		isRequired: boolean;
	}[];

	// Current assignment (for active deployment - can differ from defaults)
	currentResources?: {
		resourceId: number;
		quantity: number;
		isPrimary: boolean;
	}[];

	currentPersonnel?: {
		userId: number;
		specialization: ResponderSpecialization;
	}[];

	status: ResourceStatus;
	currentDeploymentId?: number;

	latitude?: number;
	longitude?: number;
	lastLocationUpdate?: Date;

	createdAt?: Date;
	updatedAt?: Date;
}

export interface AvailableResponseUnitSearchResult {
	unitId: number;
	unitName: string;
	departmentId: number;
	departmentName: string;
	unitType: ResponseUnitType;
	distanceKm: number | null;
}

export interface ResponseUnitFormData {
	unitName: string;
	departmentId: number;
	unitType: ResponseUnitType;

	defaultResources: {
		resourceId: number;
		quantity: number;
		isPrimary: boolean;
	}[];

	defaultPersonnel: {
		userId: number;
		specialization: string;
		isRequired: boolean;
	}[];
}
