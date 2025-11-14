import { RESOURCE_TYPES, ResourceType } from '@/types/resource';
export const RESOURCE_TYPE_IMAGES: Record<ResourceType, string> = {
	COMMAND_VEHICLE: '/images/commandvehicle.png',
	TEAM: '/images/team.png',
	BOAT: '/images/boat.png',
	HELICOPTER: '/images/helicopter.png',
	DRONE: '/images/drone.png',
	FIRE_TRUCK: '/images/firetruck.png',
	LADDER_TRUCK: '/images/laddertruck.png',
	AMBULANCE: '/images/ambulance.png',
	TRAUMA_HELICOPTER: '/images/traumahelicopter.png',
	PATROL_CAR: '/images/patrolcar.png',
	SWAT_CAR: '/images/swatcar.png',
	ARMORED_VEHICLE: '/images/armoredvehicle.png',
	TRANSPORT_TRUCK: '/images/transporttruck.png',
	RESCUE_VEHICLE: '/images/rescuevehicle.png',
	WATER_TANKER: '/images/watertanker.png',
	COASTGUARD_VESSEL: '/images/coastguardvessel.png',
	DEFIBRILLATOR: '/images/defibrillator.png',
	GENERATOR: '/images/generator.png',
	WATER_BOTTLE: '/images/waterbottle.png',
	MEDICAL_KIT: '/images/medicalkit.png',
};
const GENERIC_IMAGE = '/images/default.png';

export function getImageForResourceType(resourceType: string): string {
	return RESOURCE_TYPE_IMAGES[resourceType as ResourceType] || GENERIC_IMAGE;
}

export function getDisplayImageSrc(image?: string | null): string | undefined {
	const val = (image ?? '').trim();
	if (!val) return undefined;
	if (val.startsWith('data:')) return val;
	if (/^(https?:)?\//.test(val)) return val;
	let mime = 'image/png';
	if (val.startsWith('/9j/')) mime = 'image/jpeg';
	else if (val.startsWith('R0lGOD')) mime = 'image/gif';
	else if (val.startsWith('UklGR')) mime = 'image/webp';
	return `data:${mime};base64,${val}`;
}
export function getReadableResourceType(type: string): string {
	if ((RESOURCE_TYPES as readonly string[]).includes(type)) {
		return type
			.toLowerCase()
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
	return type;
}
