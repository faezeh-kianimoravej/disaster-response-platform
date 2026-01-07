export const routes = {
	home: () => '/',

	// Regions
	dashboard: () => '/dashboard',
	regions: () => '/regions',

	// Responders
	responderDashboard: () => '/responder-dashboard',

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

	// Response Units
	responseUnit: (responseUnitId: number | string) => `/response-units/${responseUnitId}`,
	responseUnitNew: () => `/response-unit/new`,
	responseUnitEdit: (responseUnitId: number | string) => `/response-units/${responseUnitId}/edit`,

	// Users
	users: () => '/users',
	userNew: () => '/users/new',
	user: (userId: number | string) => `/users/${userId}`,

	// Incidents
	incidents: () => '/incidents',
	incident: (incidentId: number | string) => `/incidents/${incidentId}`,
	incidentUpdate: (incidentId: number | string) => `/incidents/${incidentId}/update`,
	incidentPrioritize: (incidentId: number | string) => `/incidents/${incidentId}/prioritize`,
	incidentDeploymentOrder: (incidentId: number | string) =>
		`/incidents/${incidentId}/deployment-order`,

	// Chat
	chat: () => '/chat',
	chatWith: (chatId: number | string) => `/chat/${chatId}`,

	// Deployment Requests
	deploymentRequestDetails: (requestId: number | string) => `/deployment-requests/${requestId}`,
};

export type Routes = typeof routes;
