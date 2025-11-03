import type {
	Incident,
	IncidentFormData,
	IncidentSeverity,
	IncidentResourceAllocationRequest,
	IncidentResourceAllocationResponse,
} from '@/types/incident';
import { BaseApi } from './base';

const incidentApi = new BaseApi('/incidents');

// Backend response shapes (enums are UPPER_SNAKE_CASE)
type ApiSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ApiStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type ApiGrip = 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';

type ApiIncident = {
	incidentId: number | string;
	reportedBy: string;
	title: string;
	description: string;
	severity: ApiSeverity;
	gripLevel: ApiGrip;
	status: ApiStatus;
	reportedAt: string;
	location: string;
	latitude: number;
	longitude: number;
	regionId: number;
	createdAt: string;
	updatedAt: string;
};

// ---------- DRY enum/field mapping helpers ----------
const SEVERITY_IN = {
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: 'High',
	CRITICAL: 'Critical',
} as const satisfies Record<ApiSeverity, IncidentSeverity>;

const STATUS_IN = {
	OPEN: 'Open',
	IN_PROGRESS: 'In Progress',
	RESOLVED: 'Resolved',
	CLOSED: 'Closed',
} as const satisfies Record<ApiStatus, Incident['status']>;

const GRIP_IN = {
	NONE: 0,
	LEVEL_1: 1,
	LEVEL_2: 2,
	LEVEL_3: 3,
	LEVEL_4: 4,
	LEVEL_5: 5,
} as const satisfies Record<ApiGrip, number>;

function invertRecord<V extends string | number, K extends string>(obj: Record<K, V>) {
	return Object.fromEntries(
		Object.entries(obj).map(([k, v]) => [v as unknown as PropertyKey, k])
	) as Record<V, K>;
}

const SEVERITY_OUT = invertRecord(SEVERITY_IN) as Record<IncidentSeverity, ApiSeverity>;
const STATUS_OUT = invertRecord(STATUS_IN) as Record<Incident['status'], ApiStatus>;
const GRIP_OUT = invertRecord(GRIP_IN) as Record<number, ApiGrip>;

const toDate = (iso: string) => new Date(iso);

function mapIncidentApiToFrontend(api: ApiIncident): Incident {
	return {
		incidentId: Number(api.incidentId),
		reportedBy: api.reportedBy,
		title: api.title,
		description: api.description,
		severity: SEVERITY_IN[api.severity],
		gripLevel: GRIP_IN[api.gripLevel],
		status: STATUS_IN[api.status],
		reportedAt: toDate(api.reportedAt),
		location: api.location,
		latitude: api.latitude,
		longitude: api.longitude,
		regionId: Number(api.regionId),
		createdAt: toDate(api.createdAt),
		updatedAt: toDate(api.updatedAt),
	};
}

export async function getIncidents(): Promise<Incident[]> {
	const list = await incidentApi.get<ApiIncident[]>('');
	return list.map(mapIncidentApiToFrontend);
}

export async function getIncidentById(id: number): Promise<Incident | undefined> {
	try {
		const data = await incidentApi.get<ApiIncident>(`/${id}`);
		return mapIncidentApiToFrontend(data);
	} catch {
		return undefined;
	}
}

export async function createIncident(data: IncidentFormData): Promise<Incident> {
	const payload = toApiRequest(data);
	const created = await incidentApi.post<ApiIncident>('', payload);
	return mapIncidentApiToFrontend(created);
}

export async function updateIncident(
	id: number,
	data: Partial<IncidentFormData>
): Promise<Incident> {
	const payload = toApiRequest(data as IncidentFormData, true);
	const updated = await incidentApi.put<ApiIncident>(`/${id}`, payload);
	return mapIncidentApiToFrontend(updated);
}

export async function deleteIncident(id: number): Promise<void> {
	return incidentApi.delete(`/${id}`);
}

export async function allocateResourcesToIncident(
	incidentId: number,
	allocations: IncidentResourceAllocationRequest[]
): Promise<IncidentResourceAllocationResponse> {
	const payload = { allocations };

	// POST /incidents/{incidentId}/resources/allocate
	return await incidentApi.post<IncidentResourceAllocationResponse>(
		`/${incidentId}/resources/allocate`,
		payload
	);
}

type ApiIncidentRequest = {
	incidentId: number;
	reportedBy: string;
	title: string;
	description: string;
	severity: ApiSeverity;
	gripLevel: ApiGrip;
	status?: ApiStatus;
	reportedAt: string;
	location: string;
	latitude: number;
	longitude: number;
	regionId: number;
};

function toApiRequest(
	data: IncidentFormData,
	partial = false
): ApiIncidentRequest | Partial<ApiIncidentRequest> {
	const toIso = (d: Date | string) => (typeof d === 'string' ? new Date(d) : d).toISOString();
	const base: Partial<ApiIncidentRequest> = {
		...(data.reportedBy !== undefined && { reportedBy: data.reportedBy }),
		...(data.title !== undefined && { title: data.title }),
		...(data.description !== undefined && { description: data.description }),
		...(data.severity !== undefined && { severity: SEVERITY_OUT[data.severity] }),
		...(data.gripLevel !== undefined && { gripLevel: GRIP_OUT[data.gripLevel] ?? 'NONE' }),
		...(data.status !== undefined && { status: STATUS_OUT[data.status] }),
		...(data.reportedAt !== undefined && { reportedAt: toIso(data.reportedAt) }),
		...(data.location !== undefined && { location: data.location }),
		...(data.latitude !== undefined && { latitude: data.latitude }),
		...(data.longitude !== undefined && { longitude: data.longitude }),
		...(data.regionId !== undefined && { regionId: data.regionId }),
	};
	return partial ? base : (base as ApiIncidentRequest);
}
