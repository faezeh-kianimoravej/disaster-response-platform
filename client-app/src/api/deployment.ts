import { BaseApi } from '@/api/base';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Response Unit assignment interface
interface ResponseUnitAssignmentRequest {
	requestId: number;
	assignedBy: number;
	assignedUnitId: number;
	notes?: string;
}

interface DeploymentAssignRequestDTO {
	assignedBy: number;
	notes?: string;
}

interface DeploymentAssignmentResponse {
	success: boolean;
	assignedUnitId: number;
	message?: string;
}

// --- API ---
const deploymentApi = new BaseApi(`${API_BASE_URL}/deployment`);

export async function assignResponseUnitToDeploymentRequest(
	assignmentData: ResponseUnitAssignmentRequest
): Promise<DeploymentAssignmentResponse> {
	const requestBody: DeploymentAssignRequestDTO = {
		assignedBy: assignmentData.assignedBy,
		...(assignmentData.notes ? { notes: assignmentData.notes } : {}),
	};

	const response = await deploymentApi.post<DeploymentAssignmentResponse>(
		`/${assignmentData.requestId}/assign`,
		requestBody
	);
	return response;
}
