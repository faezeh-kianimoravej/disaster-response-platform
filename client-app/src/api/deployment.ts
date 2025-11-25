import { BaseApi } from '@/api/base';
import type { ResponderSpecialization } from '@/types/responderSpecialization';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Personnel slot assignment
interface AssignedPersonnel {
	slotId: number;
	userId: number;
	specialization: ResponderSpecialization;
}

// Resource allocation
interface AllocatedResource {
	resourceId: number;
	quantity: number;
	isPrimary: boolean;
}

// New full unit assignment interface
interface FillUnitAssignmentRequest {
	requestId: number;
	assignedBy: number;
	assignedUnitId: number;
	assignedPersonnel: AssignedPersonnel[];
	allocatedResources: AllocatedResource[];
	notes?: string;
}

// Legacy Response Unit assignment interface (for backward compatibility)
interface ResponseUnitAssignmentRequest {
	requestId: number;
	assignedBy: number;
	assignedUnitId: number;
	notes?: string;
}

interface DeploymentAssignRequestDTO {
	assignedBy: number;
	assignedUnitId: number;
	assignedPersonnel: AssignedPersonnel[];
	allocatedResources: AllocatedResource[];
	notes?: string;
}

interface DeploymentAssignmentResponse {
	success: boolean;
	assignedUnitId: number;
	message?: string;
}

// --- API ---
const deploymentApi = new BaseApi(`${API_BASE_URL}/department/requests`);

// New Fill Unit assignment endpoint
export async function assignFillUnitToDeploymentRequest(
	assignmentData: FillUnitAssignmentRequest
): Promise<DeploymentAssignmentResponse> {
	const requestBody: DeploymentAssignRequestDTO = {
		assignedBy: assignmentData.assignedBy,
		assignedUnitId: assignmentData.assignedUnitId,
		assignedPersonnel: assignmentData.assignedPersonnel,
		allocatedResources: assignmentData.allocatedResources,
		...(assignmentData.notes ? { notes: assignmentData.notes } : {}),
	};

	const response = await deploymentApi.post<DeploymentAssignmentResponse>(
		`/${assignmentData.requestId}/assign`,
		requestBody
	);
	return response;
}

// Legacy assignment endpoint (for backward compatibility)
export async function assignResponseUnitToDeploymentRequest(
	assignmentData: ResponseUnitAssignmentRequest
): Promise<DeploymentAssignmentResponse> {
	const requestBody = {
		assignedBy: assignmentData.assignedBy,
		...(assignmentData.notes ? { notes: assignmentData.notes } : {}),
	};

	const response = await deploymentApi.post<DeploymentAssignmentResponse>(
		`/${assignmentData.requestId}/assign`,
		requestBody
	);
	return response;
}

// Export types for use in components
export type {
	FillUnitAssignmentRequest,
	AssignedPersonnel,
	AllocatedResource,
	ResponseUnitAssignmentRequest,
};
