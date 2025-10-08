import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AlertsPage from './pages/AlertsPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourcePage from './pages/ResourcePage';

function App() {
	return (
		<Router>
			<div className="App">
				<Navigation />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/alerts" element={<AlertsPage />} />
					<Route path="/resources" element={<ResourcesPage />} />
					<Route path="/resources/:resourceId" element={<ResourcePage />} />
				</Routes>
			</div>
		</Router>
	);
}

export default App;
