import { BaseApi } from '@/api/base';
import type { ResponderSpecialization } from '@/types/responderSpecialization';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AssignedPersonnel {
	slotId: number;
	userId: number;
	specialization: ResponderSpecialization;
}

interface AllocatedResource {
	resourceId: number;
	quantity: number;
	isPrimary: boolean;
}

interface FillUnitAssignmentRequest {
	requestId: number;
	assignedBy: number;
	assignedUnitId: number;
	assignedPersonnel: AssignedPersonnel[];
	allocatedResources: AllocatedResource[];
	notes?: string;
}

interface ResponseUnitAssignmentRequest {
	requestId: number;
	assignedBy: number;
	assignedUnitId: number;
	notes?: string;
}

interface DeploymentAssignRequestDTO {
	requestId: number;
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

const deploymentApi = new BaseApi(`${API_BASE_URL}/deployment`);

export async function assignFillUnitToDeploymentRequest(
	assignmentData: FillUnitAssignmentRequest
): Promise<DeploymentAssignmentResponse> {
	const requestBody: DeploymentAssignRequestDTO = {
		requestId: assignmentData.requestId,
		assignedBy: assignmentData.assignedBy,
		assignedUnitId: assignmentData.assignedUnitId,
		assignedPersonnel: assignmentData.assignedPersonnel,
		allocatedResources: assignmentData.allocatedResources,
		...(assignmentData.notes ? { notes: assignmentData.notes } : {}),
	};

	const response = await deploymentApi.post<DeploymentAssignmentResponse>(`/assign`, requestBody);
	return response;
}

export async function assignResponseUnitToDeploymentRequest(
	assignmentData: ResponseUnitAssignmentRequest
): Promise<DeploymentAssignmentResponse> {
	const requestBody = {
		requestId: assignmentData.requestId,
		assignedBy: assignmentData.assignedBy,
		...(assignmentData.notes ? { notes: assignmentData.notes } : {}),
	};

	const response = await deploymentApi.post<DeploymentAssignmentResponse>(`/assign`, requestBody);
	return response;
}

export type {
	FillUnitAssignmentRequest,
	AssignedPersonnel,
	AllocatedResource,
	ResponseUnitAssignmentRequest,
};
