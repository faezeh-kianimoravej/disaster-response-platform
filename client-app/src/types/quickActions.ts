export const FIRE_RELATED_ACTIONS = [
	"We've arrived",
	'Fire spreading',
	'Fire contained',
	'Smoke increasing',
	'Evacuation in progress',
	'Evacuation completed',
] as const;

export const FLOOD_RELATED_ACTIONS = [
	'Water level rising',
	'Water level stable',
	'Area evacuated',
	'Roads blocked',
	'Rescue needed',
] as const;

export const GENERAL_EMERGENCY_ACTIONS = [
	'Need backup',
	'Need medical support',
	'Need additional units',
] as const;

export const GENERAL_STATUS_ACTIONS = ['Situation under control', 'Situation escalating'] as const;

export const QUICK_ACTIONS = [
	...FIRE_RELATED_ACTIONS,
	...FLOOD_RELATED_ACTIONS,
	...GENERAL_EMERGENCY_ACTIONS,
	...GENERAL_STATUS_ACTIONS,
] as const;

export type QuickActionType = (typeof QUICK_ACTIONS)[number];

export const QUICK_ACTION_CATEGORIES = {
	'Fire-related': FIRE_RELATED_ACTIONS,
	'Flood-related': FLOOD_RELATED_ACTIONS,
	'General emergency / Request support': GENERAL_EMERGENCY_ACTIONS,
	'General status': GENERAL_STATUS_ACTIONS,
} as const;
