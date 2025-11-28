// Utility to convert human-readable unit type to backend enum format
function toBackendUnitType(unitType: string): string {
	return unitType.replace(/ /g, '_').replace(/-/g, '_').toUpperCase();
}
import { ResponseUnitType, RESPONSE_UNIT_TYPES } from '@/types/responseUnit';
import { RESPONDER_SPECIALIZATIONS } from '@/types/responderSpecialization';
import { ResourceStatus } from '@/types/resource';
import { ResponderSpecialization } from '@/types/responderSpecialization';
import type { AvailableResponseUnitSearchResult } from '@/types/responseUnit';
import { BaseApi } from '@/api/base';
import type { ResponseUnit, ResponseUnitFormData } from '@/types/responseUnit';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ResponseUnitDTO {
	unitId: number | string;
	unitName: string;
	departmentId: number | string;
	unitType: ResponseUnitType;
	defaultResources: DefaultResourceDTO[];
	defaultPersonnel: DefaultPersonnelSlotDTO[];
	currentResources: CurrentResourceDTO[];
	currentPersonnel: CurrentPersonnelDTO[];
	status: ResourceStatus;
	currentDeploymentId?: number | string;
	latitude?: number;
	longitude?: number;
	lastLocationUpdate?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface DefaultResourceDTO {
	resourceId: number | string;
	quantity: number;
	isPrimary: boolean;
}

interface DefaultPersonnelSlotDTO {
	userId: number | string;
	specialization: string | ResponderSpecialization;
	isRequired: boolean;
}

interface CurrentResourceDTO {
	resourceId: number | string;
	quantity: number;
	isPrimary: boolean;
}

interface CurrentPersonnelDTO {
	userId: number | string;
	specialization: string | ResponderSpecialization;
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
	// Helper to coerce ID values which are sometimes serialized as strings by the backend
	const coerceId = (v: unknown): number | undefined => {
		if (v === null || v === undefined) return undefined;
		const n = Number(v as unknown as string | number);
		return Number.isNaN(n) ? undefined : n;
	};

	// Map backend unitType (e.g. 'RESCUE_VEHICLE') back to the frontend label from `RESPONSE_UNIT_TYPES`
	const fromBackendUnitType = (backend: string | undefined): ResponseUnitType => {
		if (!backend) return RESPONSE_UNIT_TYPES[0] as ResponseUnitType;
		const match = RESPONSE_UNIT_TYPES.find(label => toBackendUnitType(label) === backend);
		return (match ?? backend) as unknown as ResponseUnitType;
	};

	// Convert backend specialization enum (e.g. 'DRIVER') back to frontend specialization string (e.g. 'driver')
	const toBackendSpecialization = (s: string) =>
		s.replace(/ /g, '_').replace(/-/g, '_').toUpperCase();
	const fromBackendSpecialization = (backend: string | undefined): ResponderSpecialization => {
		if (!backend) return RESPONDER_SPECIALIZATIONS[0];
		const match = RESPONDER_SPECIALIZATIONS.find(s => toBackendSpecialization(s) === backend);
		return match ?? (backend.toLowerCase() as ResponderSpecialization);
	};

	const mappedDefaultResources = (dto.defaultResources || []).map(r => ({
		resourceId: coerceId(r.resourceId) ?? 0,
		quantity: r.quantity,
		isPrimary: r.isPrimary,
	}));

	const mappedDefaultPersonnel = (dto.defaultPersonnel || []).map(p => {
		const uid = coerceId(p.userId);
		return {
			...(uid !== undefined ? { userId: uid } : {}),
			specialization: fromBackendSpecialization(p.specialization as unknown as string),
			isRequired: p.isRequired,
		};
	});

	const mappedCurrentResources = (dto.currentResources || []).map(r => ({
		resourceId: coerceId(r.resourceId) ?? 0,
		quantity: r.quantity,
		isPrimary: r.isPrimary,
	}));

	const mappedCurrentPersonnel = (dto.currentPersonnel || []).map(p => ({
		userId: coerceId(p.userId) ?? 0,
		specialization: fromBackendSpecialization(p.specialization as unknown as string),
	}));
	return {
		unitId: coerceId(dto.unitId) ?? 0,
		unitName: dto.unitName,
		departmentId: coerceId(dto.departmentId) ?? 0,
		unitType: fromBackendUnitType(dto.unitType as unknown as string),
		defaultResources: mappedDefaultResources,
		defaultPersonnel: mappedDefaultPersonnel,
		currentResources: mappedCurrentResources,
		currentPersonnel: mappedCurrentPersonnel,
		status: dto.status,
		currentDeploymentId: coerceId(dto.currentDeploymentId) ?? 0,
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
		// Convert human-friendly unit type (e.g. "Rescue vehicle") to backend enum format (e.g. "RESCUE_VEHICLE")
		unitType: toBackendUnitType(form.unitType as string) as unknown as ResponseUnitType,
		defaultResources: form.defaultResources,
		// Ensure defaultPersonnel always has userId (non-optional) and proper specialization format
		defaultPersonnel: (form.defaultPersonnel || []).map(p => ({
			userId: p.userId,
			specialization: (p.specialization as string)
				.replace(/ /g, '_')
				.replace(/-/g, '_')
				.toUpperCase(),
			isRequired: p.isRequired,
		})),
		status,
	};
}

function mapResponseUnitSearchResponseDTO(
	dto: ResponseUnitSearchResponseDTO
): AvailableResponseUnitSearchResult {
	return {
		unitId: Number(dto.unitId),
		unitName: dto.unitName,
		departmentId: Number(dto.departmentId),
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
