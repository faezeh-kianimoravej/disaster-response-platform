import { IncidentSeverity } from '@/types/incident';
import { ResponderSpecialization } from '@/types/responderSpecialization';
import { ResponseUnitType } from '@/types/responseUnit';

export const DEPLOYMENT_STATUSES = [
	'Assigned',
	'Acknowledged',
	'Dispatched',
	'Arrived',
	'Active',
	'Standby',
	'Returning',
	'Completed',
	'Cancelled',
] as const;
export type DeploymentStatus = (typeof DEPLOYMENT_STATUSES)[number];

export const DEPLOYMENT_REQUEST_STATUSES = [
	'pending',
	'assigned',
	'declined',
	'cancelled',
] as const;
export type DeploymentRequestStatus = (typeof DEPLOYMENT_REQUEST_STATUSES)[number];

// Deployment Request - Coordinator requests response units or specific resources from departments
export interface DeploymentRequest {
	requestId: number;
	incidentId: number;
	deploymentOrderId: number;
	requestedBy: number;
	requestedAt: Date;

	// Target department
	targetDepartmentId: number;
	priority: IncidentSeverity;

	// Request by unit type
	requestedUnitType: ResponseUnitType;
	requestedQuantity: number;

	// Assignment by department officer
	assignedUnitId?: number;
	assignedBy?: number;
	assignedAt?: Date;

	status: DeploymentRequestStatus;
	notes?: string;
}

// Deployment Order - Coordinator's overall deployment plan for an incident
export interface DeploymentOrder {
	deploymentOrderId: number;
	incidentId: number;
	orderedBy: number;
	orderedAt: Date;

	// List of requests to departments (can target multiple departments)
	deploymentRequests: DeploymentRequest[];

	incidentSeverity: IncidentSeverity;
	gripLevel: number;
	instructions?: string;
}

// Deployment - Active deployment of a specific response unit (after assignment)
export interface Deployment {
	deploymentId: number;
	incidentId: number;
	deploymentRequestId: number;
	unitId?: number; // specific unit assigned by department officer (null for custom deployments)
	status: DeploymentStatus;

	// Actual deployed composition (may differ from unit defaults)
	deployedResources: {
		resourceId: number;
		quantity: number;
	}[];

	deployedPersonnel: {
		userId: number;
		specialization: ResponderSpecialization;
	}[];

	// Timeline
	orderedAt: Date;
	assignedAt: Date;
	acknowledgedAt?: Date;
	dispatchedAt?: Date;
	arrivedAt?: Date;
	completedAt?: Date;

	// Location tracking
	currentLatitude?: number;
	currentLongitude?: number;
	estimatedArrival?: Date;

	// Resources consumed during deployment
	consumedResources?: {
		resourceId: number;
		quantityUsed: number;
	}[];

	notes?: string;
}

// Form data for creating a new deployment order
export interface DeploymentOrderFormData {
	incidentId: number;
	orderedBy: number;
	incidentSeverity: IncidentSeverity;
	gripLevel: number;
	instructions?: string;

	// List of requests to departments
	deploymentRequests: {
		targetDepartmentId: number;
		priority: IncidentSeverity;
		requestedUnitType: string;
		requestedQuantity: number;
		notes?: string;
	}[];
}

// Cancel deployment
export interface DeploymentCancellation {
	deploymentId: number;
	cancelledBy: number;
	reason: string;
}
