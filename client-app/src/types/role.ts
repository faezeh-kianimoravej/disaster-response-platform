export type Role =
	| 'Super Admin'
	| 'Citizen'
	| 'Responder'
	| 'Officer on Duty'
	| 'Leader CoPI'
	| 'Calamity Coordinator'
	| 'Operational Leader'
	| 'Mayor'
	| 'Chair Safety Region'
	| 'Department Admin'
	| 'Municipality Admin'
	| 'Region Admin';

export const ALL_ROLES: Role[] = [
	'Super Admin',
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
];

export const ADMIN_ROLES: Role[] = [
	'Super Admin',
	'Region Admin',
	'Municipality Admin',
	'Department Admin',
];
