export const RESPONDER_SPECIALIZATIONS = [
	// General operational roles
	'driver',
	'operator',
	'team_leader',
	'commander',

	// Fire service
	'firefighter',
	'fire_engineer',
	'fire_captain',

	// Medical
	'paramedic',
	'emt_basic',
	'emt_advanced',
	'nurse',
	'doctor',

	// Specialized
	'hazmat_specialist',
	'rescue_specialist',
	'bomb_technician',
	'diver',
	'search_and_rescue',
	'incident_commander',

	// Support
	'communications_specialist',
	'logistics_coordinator',
] as const;

export type ResponderSpecialization = (typeof RESPONDER_SPECIALIZATIONS)[number];

export interface ResponderProfile {
	userId: number;
	departmentId: number;

	primarySpecialization: ResponderSpecialization;
	secondarySpecializations?: ResponderSpecialization[];

	isAvailable: boolean;
	currentDeploymentId?: number;
}

export interface ResponderProfileFormData {
	userId: number;
	departmentId: number;
	primarySpecialization: ResponderSpecialization;
	secondarySpecializations?: ResponderSpecialization[];
}
