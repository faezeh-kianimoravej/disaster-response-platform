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
