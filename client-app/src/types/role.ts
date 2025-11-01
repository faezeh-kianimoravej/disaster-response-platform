export const ALL_ROLES = [
	'Citizen',
	'Responder',
	'Officer on Duty',
	'Leader CoPI',
	'Calamity Coordinator',
	'Operational Leader',
	'Mayor',
	'Chair Safety Region',
	'Department Admin',
	'Municipality Admin',
	'Region Admin',
] as const;
export type Role = (typeof ALL_ROLES)[number];

export const ADMIN_ROLES = ['Region Admin', 'Municipality Admin', 'Department Admin'] as const;

export const REGION_ROLES = [
	'Region Admin',
	'Chair Safety Region',
	'Calamity Coordinator',
] as const;

export const MUNICIPALITY_ROLES = ['Municipality Admin', 'Mayor', 'Operational Leader'] as const;

export const DEPARTMENT_ROLES = [
	'Department Admin',
	'Leader CoPI',
	'Officer on Duty',
	'Responder',
] as const;
