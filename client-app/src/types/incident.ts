export const INCIDENT_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const INCIDENT_STATUS = ['Open', 'In Progress', 'Resolved', 'Closed'] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUS)[number];

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
