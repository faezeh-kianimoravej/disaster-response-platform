import { BaseApi } from '@/api/base';
import type {
	DeploymentOrder,
	DeploymentOrderFormData,
	DeploymentRequest,
} from '@/types/deployment';
import { IncidentSeverity } from '@/types/incident';
import { ResponseUnitType } from '@/types/responseUnit';
import { DeploymentRequestStatus } from '@/types/deployment';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- DTOs ---
interface DeploymentOrderDTO {
	deploymentOrderId: number;
	incidentId: number;
	orderedBy: number;
	orderedAt: string;
	deploymentRequests: DeploymentRequestDTO[];
	incidentSeverity: IncidentSeverity;
	notes?: string;
}

interface DeploymentOrderCreateDTO {
	incidentId: number;
	orderedBy: number;
	incidentSeverity: IncidentSeverity;
	notes?: string;
	deploymentRequests: DeploymentOrderCreateRequestDTO[];
}

interface DeploymentOrderCreateRequestDTO {
	targetDepartmentId: number;
	requestedUnitType: ResponseUnitType;
	requestedQuantity: number;
}

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

function mapDeploymentOrderDTO(dto: DeploymentOrderDTO): DeploymentOrder {
	return {
		deploymentOrderId: dto.deploymentOrderId,
		incidentId: dto.incidentId,
		orderedBy: dto.orderedBy,
		orderedAt: new Date(dto.orderedAt),
		deploymentRequests: dto.deploymentRequests.map(mapDeploymentRequestDTO),
		incidentSeverity: dto.incidentSeverity,
		...(dto.notes !== undefined ? { notes: dto.notes } : {}),
	};
}

function mapFormToCreateDTO(form: DeploymentOrderFormData): DeploymentOrderCreateDTO {
	return {
		incidentId: form.incidentId,
		orderedBy: form.orderedBy,
		incidentSeverity: form.incidentSeverity,
		...(form.notes !== undefined ? { notes: form.notes } : {}),
		deploymentRequests: form.deploymentRequests.map(req => ({
			targetDepartmentId: req.targetDepartmentId,
			requestedUnitType: req.requestedUnitType as ResponseUnitType,
			requestedQuantity: req.requestedQuantity,
		})),
	};
}

// --- API ---
const deploymentOrderApi = new BaseApi(`${API_BASE_URL}/deployment-orders`);

export async function createDeploymentOrder(
	form: DeploymentOrderFormData
): Promise<DeploymentOrder> {
	const dto = mapFormToCreateDTO(form);
	const result = await deploymentOrderApi.post<DeploymentOrderDTO>('', dto);
	return mapDeploymentOrderDTO(result);
}

export async function getDeploymentOrderByIncidentId(incidentId: number): Promise<DeploymentOrder> {
	const dto = await deploymentOrderApi.get<DeploymentOrderDTO>(`/incident/${incidentId}`);
	return mapDeploymentOrderDTO(dto);
}
