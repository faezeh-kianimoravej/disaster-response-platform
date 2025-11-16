import { BaseApi } from '@/api/base';
import type {
	DeploymentOrder,
	DeploymentOrderFormData,
	DeploymentRequest,
} from '@/types/deployment';
import type { User } from '@/types/user';
import type { Resource, ResourceType, ResourceStatus } from '@/types/resource';
import { IncidentSeverity } from '@/types/incident';
import { ResponseUnitType } from '@/types/responseUnit';
import { DeploymentRequestStatus } from '@/types/deployment';
import { ResponderSpecialization, ResponderProfile } from '@/types/responderSpecialization';
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

// --- Allocation DTOs ---
interface AvailableUserDTO {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	mobile: string;
	primarySpecialization?: ResponderSpecialization;
	secondarySpecializations?: ResponderSpecialization[];
	isAvailable: boolean;
	currentDeploymentId?: number;
}

interface AvailableResourceDTO {
	resourceId: number;
	name: string;
	resourceType: string;
	availableQuantity: number;
	totalQuantity: number;
	unit?: string;
	status: string;
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

// --- Allocation Mapping ---
function mapAvailableUserDTO(dto: AvailableUserDTO): User {
	const user: User = {
		userId: dto.userId,
		firstName: dto.firstName,
		lastName: dto.lastName,
		email: dto.email,
		mobile: dto.mobile,
		roles: [], // Roles not needed for allocation view
		deleted: false,
	};

	if (dto.primarySpecialization) {
		const responderProfile: Partial<ResponderProfile> = {
			userId: dto.userId,
			departmentId: 0, // Not needed for allocation view
			primarySpecialization: dto.primarySpecialization,
			secondarySpecializations: dto.secondarySpecializations || [],
			isAvailable: dto.isAvailable,
		};

		if (dto.currentDeploymentId !== undefined) {
			responderProfile.currentDeploymentId = dto.currentDeploymentId;
		}

		user.responderProfile = responderProfile as ResponderProfile;
	}

	return user;
}

function mapAvailableResourceDTO(dto: AvailableResourceDTO): Resource {
	const resource: Resource = {
		resourceId: dto.resourceId,
		name: dto.name,
		departmentId: 0, // Not needed for allocation view
		description: '',
		category: 'VEHICLE' as const, // Default, not critical for allocation
		resourceType: dto.resourceType as ResourceType,
		resourceKind: 'UNIQUE' as const, // Default
		status: dto.status as ResourceStatus,
		totalQuantity: dto.totalQuantity,
		availableQuantity: dto.availableQuantity,
		isTrackable: false,
	};

	if (dto.unit) {
		resource.unit = dto.unit as 'PIECES' | 'LITERS' | 'SETS' | 'UNITS';
	}

	return resource;
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

export async function getDeploymentRequestById(requestId: number): Promise<DeploymentRequest> {
	const dto = await deploymentOrderApi.get<DeploymentRequestDTO>(`/requests/${requestId}`);
	return mapDeploymentRequestDTO(dto);
}

// --- Allocation APIs ---

/**
 * Get available users from target department that can be assigned to the deployment request
 * Filters users based on required specialization for the unit type
 */
export async function getAvailableUsersForUnit(
	departmentId: number,
	unitType: ResponseUnitType
): Promise<User[]> {
	const dtos = await deploymentOrderApi.get<AvailableUserDTO[]>(
		`/allocation/departments/${departmentId}/available-users?unitType=${encodeURIComponent(unitType)}`
	);
	return dtos.map(mapAvailableUserDTO);
}

/**
 * Get available resources from target department that can be assigned to the deployment request
 * Filters resources based on unit type requirements and availability
 */
export async function getAvailableResourcesForUnit(
	departmentId: number,
	unitType: ResponseUnitType
): Promise<Resource[]> {
	const dtos = await deploymentOrderApi.get<AvailableResourceDTO[]>(
		`/allocation/departments/${departmentId}/available-resources?unitType=${encodeURIComponent(unitType)}`
	);
	return dtos.map(mapAvailableResourceDTO);
}

/**
 * Assign users and resources to a deployment request
 * Creates a response unit and marks the request as assigned
 */
export async function assignDeploymentRequest(
	assignmentData: DeploymentAssignmentRequest
): Promise<DeploymentAssignmentResponse> {
	const response = await deploymentOrderApi.post<DeploymentAssignmentResponse>(
		`/requests/${assignmentData.requestId}/assign`,
		assignmentData
	);
	return response;
}
