// Utility to convert human-readable unit type to backend enum format
function toBackendUnitType(unitType: string): string {
	return unitType.replace(/ /g, '_').replace(/-/g, '_').toUpperCase();
}
import { ResponseUnitType } from '@/types/responseUnit';
import { ResourceStatus } from '@/types/resource';
import { ResponderSpecialization } from '@/types/responderSpecialization';
import type { AvailableResponseUnitSearchResult } from '@/types/responseUnit';
import { BaseApi } from '@/api/base';
import type { ResponseUnit, ResponseUnitFormData } from '@/types/responseUnit';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ResponseUnitDTO {
	unitId: number;
	unitName: string;
	departmentId: number;
	unitType: ResponseUnitType;
	defaultResources: DefaultResourceDTO[];
	defaultPersonnel: DefaultPersonnelSlotDTO[];
	currentResources: CurrentResourceDTO[];
	currentPersonnel: CurrentPersonnelDTO[];
	status: ResourceStatus;
	currentDeploymentId?: number;
	latitude?: number;
	longitude?: number;
	lastLocationUpdate?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface DefaultResourceDTO {
	resourceId: number;
	quantity: number;
	isPrimary: boolean;
}

interface DefaultPersonnelSlotDTO {
	userId?: number;
	specialization: ResponderSpecialization;
	isRequired: boolean;
}

interface CurrentResourceDTO {
	resourceId: number;
	quantity: number;
	isPrimary: boolean;
}

interface CurrentPersonnelDTO {
	userId: number;
	specialization: ResponderSpecialization;
}

interface ResponseUnitCreateDTO {
	unitName: string;
	departmentId: number;
	unitType: ResponseUnitType;
	defaultResources: DefaultResourceDTO[];
	defaultPersonnel: DefaultPersonnelSlotDTO[];
	status: ResourceStatus;
}

interface ResponseUnitSearchRequestDTO {
	incidentId: number;
	unitType: ResponseUnitType;
	departmentId?: number;
	municipalityId?: number;
}

interface ResponseUnitSearchResponseDTO {
	unitId: number;
	unitName: string;
	departmentId: number;
	departmentName: string;
	unitType: ResponseUnitType;
	distanceKm: number;
}

// --- Mapping
function mapResponseUnitDTO(dto: ResponseUnitDTO): ResponseUnit {
	return {
		unitId: dto.unitId,
		unitName: dto.unitName,
		departmentId: dto.departmentId,
		unitType: dto.unitType,
		defaultResources: dto.defaultResources,
		defaultPersonnel: dto.defaultPersonnel,
		currentResources: dto.currentResources,
		currentPersonnel: dto.currentPersonnel,
		status: dto.status,
		currentDeploymentId: dto.currentDeploymentId ?? 0,
		latitude: dto.latitude ?? 0,
		longitude: dto.longitude ?? 0,
		lastLocationUpdate: dto.lastLocationUpdate ? new Date(dto.lastLocationUpdate) : new Date(0),
		createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(0),
		updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(0),
	};
}

function mapResponseUnitDTOs(dtos: ResponseUnitDTO[]): ResponseUnit[] {
	return dtos.map(mapResponseUnitDTO);
}

function mapFormToCreateDTO(
	form: ResponseUnitFormData,
	status: ResourceStatus
): ResponseUnitCreateDTO {
	return {
		unitName: form.unitName,
		departmentId: form.departmentId,
		unitType: form.unitType,
		defaultResources: form.defaultResources,
		defaultPersonnel: form.defaultPersonnel,
		status,
	};
}

function mapResponseUnitSearchResponseDTO(
	dto: ResponseUnitSearchResponseDTO
): AvailableResponseUnitSearchResult {
	return {
		unitId: dto.unitId,
		unitName: dto.unitName,
		departmentId: dto.departmentId,
		departmentName: dto.departmentName,
		unitType: dto.unitType,
		distanceKm: dto.distanceKm,
	};
}

function mapResponseUnitSearchResponseDTOs(
	dtos: ResponseUnitSearchResponseDTO[]
): AvailableResponseUnitSearchResult[] {
	return dtos.map(mapResponseUnitSearchResponseDTO);
}

// --- API ---
const responseUnitApi = new BaseApi(`${API_BASE_URL}/response-units`);

export async function createResponseUnit(
	form: ResponseUnitFormData,
	status: ResourceStatus
): Promise<ResponseUnit> {
	const dto = mapFormToCreateDTO(form, status);
	const result = await responseUnitApi.post<ResponseUnitDTO>('', dto);
	return mapResponseUnitDTO(result);
}

export async function getResponseUnitById(unitId: number): Promise<ResponseUnit> {
	const dto = await responseUnitApi.get<ResponseUnitDTO>(`/${unitId}`);
	return mapResponseUnitDTO(dto);
}

export async function getResponseUnitsByDepartmentId(
	departmentId: number
): Promise<ResponseUnit[]> {
	const dtos = await responseUnitApi.get<ResponseUnitDTO[]>(`/department/${departmentId}`);
	return mapResponseUnitDTOs(dtos);
}

export async function getAllResponseUnits(): Promise<ResponseUnit[]> {
	const dtos = await responseUnitApi.get<ResponseUnitDTO[]>('');
	return mapResponseUnitDTOs(dtos);
}

export async function updateResponseUnit(
	unitId: number,
	form: ResponseUnitFormData,
	status: ResourceStatus
): Promise<ResponseUnit> {
	const dto = mapFormToCreateDTO(form, status);
	const result = await responseUnitApi.put<ResponseUnitDTO>(`/${unitId}`, dto);
	return mapResponseUnitDTO(result);
}

export async function deleteResponseUnit(unitId: number): Promise<void> {
	await responseUnitApi.delete(`/${unitId}`);
}

export async function searchAvailableResponseUnits(
	request: ResponseUnitSearchRequestDTO
): Promise<AvailableResponseUnitSearchResult[]> {
	// Map unitType to backend format
	const backendRequest = {
		...request,
		unitType: toBackendUnitType(request.unitType as string),
	};
	const result = await responseUnitApi.post<ResponseUnitSearchResponseDTO[]>(
		'/search',
		backendRequest
	);
	return mapResponseUnitSearchResponseDTOs(result);
}
