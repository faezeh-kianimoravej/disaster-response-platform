export interface Department {
	departmentId: number;
	municipalityId: number;
	name: string;
	image: string;
	resources?: ResourceSummary[];
}

export interface ResourceSummary {
	resourceId: number;
	name: string;
	image: string;
}

export interface DepartmentFormData {
	municipalityId: number;
	name: string;
	image: string;
}
