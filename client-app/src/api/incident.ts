import type {
	Incident,
	IncidentFormData,
	IncidentSeverity,
	IncidentResourceAllocationRequest,
	IncidentResourceAllocationResponse,
} from '@/types/incident';
import { Resource } from '@/types/resource';
import { BaseApi } from './base';

const incidentApi = new BaseApi('/incidents');

// ----------------------------------------
// API endpoints / requests
// ----------------------------------------

export async function getIncidents(regionId: number): Promise<Incident[]> {
	const apiList = await incidentApi.get<ApiIncident[]>(`/region/${regionId}`);
	return fromApiIncidents(apiList);
}

export async function getIncidentById(id: number): Promise<Incident | undefined> {
	try {
		const data = await incidentApi.get<ApiIncident>(`/${id}`);
		return fromApiIncident(data);
	} catch {
		return undefined;
	}
}

export async function createIncident(data: IncidentFormData): Promise<Incident> {
	const payload = toApiRequest(data) as ApiIncidentRequest;
	const created = await incidentApi.post<ApiIncident>('', payload);
	return fromApiIncident(created);
}

export async function updateIncident(
	id: number,
	data: Partial<IncidentFormData>
): Promise<Incident> {
	const payload = toApiRequest(data as IncidentFormData, true) as Partial<ApiIncidentRequest>;
	const updated = await incidentApi.put<ApiIncident>(`/${id}`, payload);
	return fromApiIncident(updated);
}

export async function deleteIncident(id: number): Promise<void> {
	return incidentApi.delete(`/${id}`);
}

// ----------------------------------------
// Helpers & conversion (Api <-> Domain)
// ----------------------------------------

type ApiSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ApiStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type ApiGrip = 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'LEVEL_4' | 'LEVEL_5';

export type ApiIncident = {
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

type ApiIncidentRequest = {
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

function fromApiIncident(a: ApiIncident): Incident {
	return {
		incidentId: Number(a.incidentId),
		reportedBy: a.reportedBy,
		title: a.title,
		description: a.description,
		severity: SEVERITY_IN[a.severity],
		gripLevel: GRIP_IN[a.gripLevel] ?? 0,
		status: STATUS_IN[a.status],
		reportedAt: new Date(a.reportedAt),
		location: a.location,
		latitude: a.latitude,
		longitude: a.longitude,
		regionId: Number(a.regionId),
		createdAt: new Date(a.createdAt),
		updatedAt: new Date(a.updatedAt),
	};
}

function fromApiIncidents(list: ApiIncident[]): Incident[] {
	return list.map(fromApiIncident);
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
export async function getAllocatedResources(incidentId: number): Promise<Resource[]> {
	// TODO: Uncomment when API is ready
	//return await incidentApi.get<Resource[]>(`/${incidentId}/allocations`);
	
	// Fake data for testing - suppress unused parameter warning
	//console.log(`Loading allocations for incident ${incidentId}`);
	
	// Fake data matching Resource interface
	return Promise.resolve([
		{
			resourceId: 1,
			departmentId: 1,
			name: 'EMS Unit 01',
			description: 'Advanced Life Support Ambulance',
			quantity: 2,
			available: 5,
			resourceType: 'Ambulance',
			image: '/images/ambulance.png'
		},
		{
			resourceId: 2,
			departmentId: 2,
			name: 'Fire Engine 12',
			description: 'Heavy Rescue Fire Truck',
			quantity: 1,
			available: 3,
			resourceType: 'Fire Truck',
			image: '/images/fire-truck.png'
		}
	]);
}

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
