export interface Department {
	departmentId: number;
	municipalityId: number;
	name: string;
	description?: string;
	contactInfo?: string;
	image: string;
	capacity?: number;
	currentStaff?: number;
}

export interface DepartmentFormData {
	municipalityId: number;
	name: string;
	description?: string;
	contactInfo?: string;
	image: string;
	capacity?: number;
	currentStaff?: number;
}
