/**
 * Note: The backend API returns municipalityId and regionId as strings
 * (due to ToStringSerializer for JavaScript safety with large numbers).
 * Convert to numbers when comparing: Number(municipality.regionId) === Number(urlParam)
 */
export interface Municipality {
	municipalityId: number;
	regionId: number;
	name: string;
	image: string;
}
