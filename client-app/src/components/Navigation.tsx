import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
	const location = useLocation();

	const navItems = [
		{ path: '/', label: 'Dashboard' },
		{ path: '/alerts', label: 'Alerts' },
		{ path: '/resources', label: 'Resources' },
	];

	return (
		<nav className="bg-blue-600 shadow-lg">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Link to="/" className="text-white text-xl font-bold">
							DRCCS
						</Link>
					</div>
					<div className="flex space-x-8">
						{navItems.map(item => (
							<Link
								key={item.path}
								to={item.path}
								className={`text-white hover:text-blue-200 transition-colors ${
									location.pathname === item.path ? 'font-semibold border-b-2 border-blue-200' : ''
								}`}
							>
								{item.label}
							</Link>
						))}
					</div>
				</div>
			</div>
		</nav>
	);
}
