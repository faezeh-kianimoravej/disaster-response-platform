import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AlertsPage from './pages/AlertsPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourcePage from './pages/ResourcePage';
import DepartmentPage from './pages/DepartmentPage';
import DepartmentsPage from './pages/DepartmentsPage';

import { ToastProvider } from './components/toast/ToastProvider';

function App() {
	return (
		<ToastProvider>
			<Router>
				<div className="App">
					<Navigation />
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/alerts" element={<AlertsPage />} />
						<Route path="/resources" element={<ResourcesPage />} />
						<Route path="/resources/:resourceId" element={<ResourcePage />} />
						<Route path="/departments" element={<DepartmentsPage municipalityId={201} />} />
						<Route
							path="/departments/:departmentId"
							element={<DepartmentPage municipalityId={201} />}
						/>
					</Routes>
				</div>
			</Router>
		</ToastProvider>
	);
}

export default App;
