/**
 * Note: The backend API returns departmentId and municipalityId as strings
 * (due to ToStringSerializer for JavaScript safety with large numbers).
 * Convert to numbers when comparing: Number(dept.municipalityId) === Number(urlParam)
 */
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
