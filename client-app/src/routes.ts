export const routes = {
	home: () => '/',
	login: () => '/login',

	// Regions
	dashboard: () => '/dashboard',
	regions: () => '/regions',

	// Municipalities
	municipalities: (regionId?: number | string) =>
		regionId !== undefined ? `/municipalities/${regionId}` : '/municipalities',

	// Departments
	departments: (municipalityId?: number | string) =>
		municipalityId !== undefined ? `/departments/${municipalityId}` : '/departments',
	departmentNew: () => '/department/new',
	department: (departmentId: number | string) => `/department/${departmentId}`,

	// Resources
	resources: (departmentId?: number | string) =>
		departmentId !== undefined ? `/resources/${departmentId}` : '/resources',
	resource: (resourceId: number | string) => `/resource/${resourceId}`,
	resourceNew: () => `/resource/new`,

	// Users
	users: () => '/users',
	userNew: () => '/users/new',
	user: (userId: number | string) => `/users/${userId}`,

	// Incidents
	incidents: () => '/incidents',
	incident: (incidentId: number | string) => `/incidents/${incidentId}`,
	incidentPrioritize: (incidentId: number | string) => `/incidents/${incidentId}/prioritize`,
	incidentDeploymentOrder: (incidentId: number | string) =>
		`/incidents/${incidentId}/deployment-order`,

	// Deployment Requests
	deploymentRequestDetails: (requestId: number | string) => `/deployment-requests/${requestId}`,
};

export type Routes = typeof routes;
