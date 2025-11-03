/**
 * Note: The backend API returns resourceId and departmentId as strings
 * (due to ToStringSerializer for JavaScript safety with large numbers).
 * Convert to numbers when comparing: Number(resource.departmentId) === Number(urlParam)
 */
export interface Resource {
	resourceId: number;
	departmentId: number;
	name: string;
	description: string;
	quantity: number;
	available: number;
	resourceType: string;
	image: string;
}

export interface ResourceFormData {
	name: string;
	description: string;
	quantity: number;
	available: number;
	resourceType: string;
	departmentId: number;
	image: string;
}

export interface ResourceSearchResult {
	resourceId: number;
	resourceType: string;
	department: string;
	municipality: string;
	available: number;
	distance: string;
}
