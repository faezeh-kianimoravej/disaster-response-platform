import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AlertsPage from './pages/AlertsPage';
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
						<Route path="/" element={<HomePage />} />
						<Route path="/incidents/:incidentId" element={<IncidentDetailsPage />} />
						<Route path="/alerts" element={<AlertsPage />} />
						<Route path="/incidents/:incidentId/prioritize" element={<IncidentPriorityPage />} />
						<Route
							path="/incidents/:incidentId/allocate-resources"
							element={<IncidentAllocateResourcePage />}
						/>
						<Route path="/resources/:departmentId" element={<ResourcesPage />} />
						<Route path="/resources/:departmentId/:resourceId" element={<ResourcePage />} />
						<Route path="/departments/:municipalityId" element={<DepartmentsPage />} />
						<Route path="/departments/:municipalityId/:departmentId" element={<DepartmentPage />} />
						<Route path="/municipalities" element={<MunicipalitiesPage />} />
					</Routes>
				</div>
			</Router>
		</AppProviders>
	);
}

export default App;
