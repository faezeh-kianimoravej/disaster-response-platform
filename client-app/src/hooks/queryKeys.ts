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
};

export const INCIDENT_QUERY_KEYS = {
	list: (regionId: number) => ['incidents', regionId] as const,
	item: (incidentId: number) => ['incident', incidentId] as const,
};

export const RESOURCE_QUERY_KEYS = {
	list: (departmentId: number) => ['resources', departmentId] as const,
	item: (resourceId: number) => ['resource', resourceId] as const,
};
