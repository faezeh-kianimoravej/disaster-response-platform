export interface Resource {
	resourceId: number;
	departmentId: number;
	name: string;
	description?: string;
	quantity: number;
	available: number;
	resourceType: string;
	latitude?: number;
	longitude?: number;
	image: string;
}

export interface ResourceFormData {
	name: string;
	description?: string | null;
	quantity: number;
	available: number;
	resourceType: string;
	departmentId: number;
	image: string;
}

export interface ResourceSearchResult extends Resource {
	department: string;
	municipality: string;
	distance: string;
}
