export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

/**
 * Note: The backend API returns incidentId and departmentId as strings
 * (due to ToStringSerializer for JavaScript safety with large numbers).
 * Convert to numbers when comparing: Number(incident.departmentId) === Number(urlParam)
 */
export interface Incident {
	incidentId: number;
	reportedBy: string;
	title: string;
	description: string;
	severity: IncidentSeverity;
	gripLevel: number;
	status: IncidentStatus;
	reportedAt: Date;
	location: string;
	latitude: number;
	longitude: number;
	regionId: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface IncidentFormData {
	incidentId: number;
	reportedBy: string;
	title: string;
	description: string;
	severity: IncidentSeverity;
	gripLevel: number;
	status: IncidentStatus;
	reportedAt: Date | string;
	location: string;
	latitude: number;
	longitude: number;
	regionId: number;
}

export interface IncidentResourceAllocationRequest {
	resourceId: number;
	quantity: number;
}

export interface IncidentResourceAllocationResponse {
	incidentId: number;
	allocatedResources: {
		resourceId: number;
		quantity: number;
	}[];
	status: string;
	message?: string;
	timestamp?: string;
}
