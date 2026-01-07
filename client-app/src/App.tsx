import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import Navigation from '@/components/layout/Navigation';
import { AppProviders } from './context/AppProviders';

// Lazy load all pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ResponderDashboardPage = lazy(() => import('@/pages/ResponderDashboardPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const UserDetailsPage = lazy(() => import('@/pages/UserDetailsPage'));
const UserCreatePage = lazy(() => import('@/pages/UserCreatePage'));
const UnauthorizedPage = lazy(() => import('@/pages/NotAuthorizedPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const ResourcePage = lazy(() => import('./pages/ResourcePage'));
const ResponseUnitPage = lazy(() => import('./pages/ResponseUnitPage'));
const ResponseUnitDetailsPage = lazy(() => import('./pages/ResponseUnitDetailsPage'));
const DepartmentPage = lazy(() => import('./pages/DepartmentPage'));
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'));
const MunicipalitiesPage = lazy(() => import('./pages/MunicipalitiesPage'));
const IncidentDetailsPage = lazy(() => import('./pages/IncidentDetailsPage'));const SendCrisisUpdatePage = lazy(() => import('@/pages/SendCrisisUpdatePage'));const IncidentPriorityPage = lazy(() => import('./pages/IncidentPriorityPage'));
const IncidentDeploymentOrder = lazy(() => import('./pages/IncidentDeploymentOrder'));
const DeploymentRequestDetailsPage = lazy(() => import('./pages/DeploymentRequestDetailsPage'));
const ChatPage = lazy(() => import('./pages/Chat'));

function App() {
	return (
		<AppProviders>
			<Router>
				<div className="App">
					<Navigation />
					<Suspense fallback={<div className="loading">Loading...</div>}>
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/dashboard" element={<DashboardPage />} />						<Route path="/responder-dashboard" element={<ResponderDashboardPage />} />
							<Route path="/incidents/:incidentId" element={<IncidentDetailsPage />} />						<Route path="/incidents/:incidentId/update" element={<SendCrisisUpdatePage />} />							<Route path="/chat" element={<ChatPage />} />
							<Route path="/chat/:chatId" element={<ChatPage />} />
							<Route path="/incidents/:incidentId/prioritize" element={<IncidentPriorityPage />} />
							<Route
								path="/incidents/:incidentId/deployment-order"
								element={<IncidentDeploymentOrder />}
							/>

							{/* Deployment Request Details */}
							<Route
								path="/deployment-requests/:requestId"
								element={<DeploymentRequestDetailsPage />}
							/>

							<Route path="/resources" element={<ResourcesPage />} />
							<Route path="/resources/:departmentId" element={<ResourcesPage />} />

							{/* Resource detail / new */}
							<Route path="/resource/new" element={<ResourcePage />} />
							<Route path="/resource/:resourceId" element={<ResourcePage />} />

							{/* Response Unit detail / new */}
							<Route path="/response-unit/new" element={<ResponseUnitPage />} />
							<Route path="/response-units/:unitId" element={<ResponseUnitDetailsPage />} />
							<Route path="/response-units/:responseUnitId/edit" element={<ResponseUnitPage />} />

							{/* Departments list by municipality (municipalityId optional) */}
							<Route path="/departments" element={<DepartmentsPage />} />
							<Route path="/departments/:municipalityId" element={<DepartmentsPage />} />

							{/* Department detail / new */}
							<Route path="/department/new" element={<DepartmentPage />} />
							<Route path="/department/:departmentId" element={<DepartmentPage />} />

							{/* Municipalities (regionId optional) */}
							<Route path="/municipalities" element={<MunicipalitiesPage />} />
							<Route path="/municipalities/:regionId" element={<MunicipalitiesPage />} />

							<Route path="/users" element={<UsersPage />} />
							<Route path="/users/new" element={<UserCreatePage />} />
							<Route path="/users/:userId" element={<UserDetailsPage />} />

							{/* Unknown routes -> 401 Unauthorized */}
							<Route path="*" element={<UnauthorizedPage />} />
						</Routes>
					</Suspense>
				</div>
			</Router>
		</AppProviders>
	);
}

export default App;
