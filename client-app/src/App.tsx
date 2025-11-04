import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import UserDetailsPage from '@/pages/UserDetailsPage';
import UserCreatePage from '@/pages/UserCreatePage';
import LoginPage from '@/pages/LoginPage';
import UnauthorizedPage from '@/pages/NotAuthorizedPage';
import Navigation from '@/components/layout/Navigation';
import ResourcesPage from './pages/ResourcesPage';
import ResourcePage from './pages/ResourcePage';
import DepartmentPage from './pages/DepartmentPage';
import DepartmentsPage from './pages/DepartmentsPage';
import MunicipalitiesPage from './pages/MunicipalitiesPage';
import IncidentDetailsPage from './pages/IncidentDetailsPage';
import IncidentPriorityPage from './pages/IncidentPriorityPage';
import IncidentAllocateResourcePage from './pages/IncidentAllocateResourcePage';
import { AppProviders } from './context/AppProviders';

function App() {
	return (
		<AppProviders>
			<Router>
				<div className="App">
					<Navigation />
					<Routes>
						<Route path="/" element={<DashboardPage />} />

						<Route path="/incidents/:incidentId" element={<IncidentDetailsPage />} />
						<Route path="/incidents/:incidentId/prioritize" element={<IncidentPriorityPage />} />
						<Route
							path="/incidents/:incidentId/allocate-resources"
							element={<IncidentAllocateResourcePage />}
						/>
						<Route path="/resources/:departmentId" element={<ResourcesPage />} />

						{/* Resource detail / new */}
						<Route path="/resource/new" element={<ResourcePage />} />
						<Route path="/resource/:resourceId" element={<ResourcePage />} />

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

						{/* Auth */}
						<Route path="/login" element={<LoginPage />} />

						{/* Unknown routes -> 401 Unauthorized */}
						<Route path="*" element={<UnauthorizedPage />} />
					</Routes>
				</div>
			</Router>
		</AppProviders>
	);
}

export default App;
