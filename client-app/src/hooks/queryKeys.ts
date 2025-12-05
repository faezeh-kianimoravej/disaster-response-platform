export const DEPLOYMENT_ORDER_QUERY_KEYS = {
	byIncident: (incidentId: number) => ['deployment-order', 'incident', incidentId] as const,
};

export const DEPLOYMENT_REQUEST_QUERY_KEYS = {
	item: (requestId: number) => ['deployment-request', requestId] as const,
};

export const REGION_QUERY_KEYS = {
	list: ['regions'] as const,
	item: (regionId: number) => ['region', regionId] as const,
};

export const MUNICIPALITY_QUERY_KEYS = {
	list: (regionId: number) => ['municipalities', regionId] as const,
	item: (municipalityId: number) => ['municipality', municipalityId] as const,
};

export const DEPARTMENT_QUERY_KEYS = {
	list: (municipalityId: number) => ['departments', municipalityId] as const,
	item: (departmentId: number) => ['department', departmentId] as const,
	all: ['departments', 'all'] as const,
};

export const INCIDENT_QUERY_KEYS = {
	list: (regionId: number) => ['incidents', regionId] as const,
	item: (incidentId: number) => ['incident', incidentId] as const,
};

export const RESOURCE_QUERY_KEYS = {
	list: (departmentId: number) => ['resources', departmentId] as const,
	item: (resourceId: number) => ['resource', resourceId] as const,
	search: (
		incidentId: number,
		resourceType: string,
		departmentId: string,
		municipalityId: string
	) => ['resources', 'search', incidentId, resourceType, departmentId, municipalityId] as const,
};

export const USER_QUERY_KEYS = {
	list: ['users'] as const,
	item: (userId: number | string) => ['user', userId] as const,
	byRegion: (regionId: number) => ['users', 'region', regionId] as const,
	byMunicipality: (municipalityId: number) => ['users', 'municipality', municipalityId] as const,
	byDepartment: (departmentId: number) => ['users', 'department', departmentId] as const,
	byEmail: (email: string) => ['user', 'email', email] as const,
};

export const RESPONSE_UNIT_QUERY_KEYS = {
	all: ['response-units'] as const,
	list: (departmentId: number) => ['response-units', 'list', departmentId] as const,
	item: (unitId: number) => ['response-units', 'item', unitId] as const,
};
