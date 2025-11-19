import { BaseApi } from '@/api/base';
import type { DeploymentRequest } from '@/types/deployment';
import { DeploymentRequestStatus } from '@/types/deployment';
import { ResponseUnitType } from '@/types/responseUnit';
import { IncidentSeverity } from '@/types/incident';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- DTOs ---
interface DeploymentRequestDTO {
	requestId: number;
	incidentId: number;
	deploymentOrderId: number;
	requestedBy: number;
	requestedAt: string;
	targetDepartmentId: number;
	priority: IncidentSeverity;
	requestedUnitType: ResponseUnitType;
	requestedQuantity: number;
	assignedUnitId?: number;
	assignedBy?: number;
	assignedAt?: string;
	status: DeploymentRequestStatus;
	notes?: string;
}

interface DeploymentAssignmentRequest {
	requestId: number;
	assignedBy: number;
	assignedUsers: number[];
	assignedResources: {
		resourceId: number;
		quantity: number;
	}[];
	notes?: string;
}

interface DeploymentAssignmentResponse {
	success: boolean;
	assignedUnitId: number;
	message?: string;
}

// --- Mapping ---
function mapDeploymentRequestDTO(dto: DeploymentRequestDTO): DeploymentRequest {
	return {
		requestId: dto.requestId,
		incidentId: dto.incidentId,
		deploymentOrderId: dto.deploymentOrderId,
		requestedBy: dto.requestedBy,
		requestedAt: new Date(dto.requestedAt),
		targetDepartmentId: dto.targetDepartmentId,
		priority: dto.priority,
		requestedUnitType: dto.requestedUnitType,
		requestedQuantity: dto.requestedQuantity,
		...(dto.assignedUnitId !== undefined ? { assignedUnitId: dto.assignedUnitId } : {}),
		...(dto.assignedBy !== undefined ? { assignedBy: dto.assignedBy } : {}),
		...(dto.assignedAt ? { assignedAt: new Date(dto.assignedAt) } : {}),
		status: dto.status,
	};
}

// --- API ---
const deploymentRequestApi = new BaseApi(`${API_BASE_URL}/deployment-requests`);

export async function getDeploymentRequestById(id: number): Promise<DeploymentRequest> {
	const dto = await deploymentRequestApi.get<DeploymentRequestDTO>(`/${id}`);
	return mapDeploymentRequestDTO(dto);
}

export async function assignDeploymentRequest(
	assignmentData: DeploymentAssignmentRequest
): Promise<DeploymentAssignmentResponse> {
	const response = await deploymentRequestApi.post<DeploymentAssignmentResponse>(
		`/${assignmentData.requestId}/assign`,
		assignmentData
	);
	return response;
}
