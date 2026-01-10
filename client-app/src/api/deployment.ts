import type { Incident } from '@/types/incident';
import { BaseApi } from './base';

// Define API types for deployment
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

// We need to create our own fromApiIncident function since it's not exported
const SEVERITY_IN = {
	LOW: 'LOW',
	MEDIUM: 'MEDIUM',
	HIGH: 'HIGH',
	CRITICAL: 'CRITICAL',
} as const;

const STATUS_IN = {
	OPEN: 'Open',
	IN_PROGRESS: 'In Progress',
	RESOLVED: 'Resolved',
	CLOSED: 'Closed',
} as const;

const GRIP_IN = {
	NONE: 0,
	LEVEL_1: 1,
	LEVEL_2: 2,
	LEVEL_3: 3,
	LEVEL_4: 4,
	LEVEL_5: 5,
} as const;

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

const deploymentApi = new BaseApi('/deployment');

// ----------------------------------------
// API endpoints / requests
// ----------------------------------------

export async function getIncidentForResponder(responderId: number): Promise<Incident | null> {
	try {
		const apiData = await deploymentApi.get<ApiIncident>(`/responder/${responderId}/incident`);
		return fromApiIncident(apiData);
	} catch {
		return null;
	}
}