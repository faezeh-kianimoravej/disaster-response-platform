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
	deploymentOrderId: number | string;
	incidentId: number | string;
	orderedBy: number | string;
	orderedAt: string;
	deploymentRequests: DeploymentRequestDTO[];
	incidentSeverity: IncidentSeverity;
	notes?: string | null;
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
	requestId: number | string;
	incidentId: number | string;
	deploymentOrderId: number | string;
	requestedBy: number | string;
	requestedAt: string;
	targetDepartmentId: number | string;
	priority: IncidentSeverity;
	requestedUnitType: ResponseUnitType;
	requestedQuantity: number | string;
	assignedUnitId?: number | string | null;
	assignedBy?: number | string | null;
	assignedAt?: string | null;
	status: DeploymentRequestStatus;
	notes?: string;
}

// --- Mapping ---
function mapDeploymentRequestDTO(dto: DeploymentRequestDTO): DeploymentRequest {
	return {
		requestId: Number(dto.requestId),
		incidentId: Number(dto.incidentId),
		deploymentOrderId: Number(dto.deploymentOrderId),
		requestedBy: Number(dto.requestedBy),
		requestedAt: new Date(dto.requestedAt),
		targetDepartmentId: Number(dto.targetDepartmentId),
		priority: dto.priority,
		requestedUnitType: dto.requestedUnitType,
		requestedQuantity: Number(dto.requestedQuantity),
		...(dto.assignedUnitId !== undefined && dto.assignedUnitId !== null ? { assignedUnitId: Number(dto.assignedUnitId) } : {}),
		...(dto.assignedBy !== undefined && dto.assignedBy !== null ? { assignedBy: Number(dto.assignedBy) } : {}),
		...(dto.assignedAt ? { assignedAt: new Date(dto.assignedAt) } : {}),
		status: dto.status,
	};
}

function mapDeploymentOrderDTO(dto: DeploymentOrderDTO): DeploymentOrder {
	return {
		deploymentOrderId: Number(dto.deploymentOrderId),
		incidentId: Number(dto.incidentId),
		orderedBy: Number(dto.orderedBy),
		orderedAt: new Date(dto.orderedAt),
		deploymentRequests: dto.deploymentRequests?.map(mapDeploymentRequestDTO) || [],
		incidentSeverity: dto.incidentSeverity,
		...(dto.notes !== undefined && dto.notes !== null ? { notes: dto.notes } : {}),
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
			// Convert the human-readable unit type to backend enum format
			requestedUnitType: (req.requestedUnitType as string)
				.replace(/ /g, '_')
				.replace(/-/g, '_')
				.toUpperCase() as unknown as ResponseUnitType,
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

export async function getDeploymentOrderByIncidentId(incidentId: number): Promise<DeploymentOrder[]> {
	try {
		const response = await deploymentOrderApi.get<DeploymentOrderDTO | DeploymentOrderDTO[]>(`/incident/${incidentId}`);
		
		// If the response is null, undefined, or empty, return empty array
		if (!response) {
			return [];
		}
		
		// Handle array response - return all deployment orders
		if (Array.isArray(response)) {
			if (response.length === 0) {
				return [];
			}
			
			// Sort by date (most recent first) and return all
			const sortedOrders = response.sort((a, b) => 
				new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
			);
			
			return sortedOrders.map(order => mapDeploymentOrderDTO(order));
		}
		
		// Handle single object response
		return [mapDeploymentOrderDTO(response)];
	} catch (error: any) {
		// If no deployment order exists (404), return empty array instead of throwing
		if (error.status === 404) {
			return [];
		}
		// Re-throw other errors
		throw error;
	}
}
