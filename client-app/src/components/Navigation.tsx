import { Link, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import NotificationPanel from '@/components/NotificationPanel';
import AccountPanel from '@/components/AccountPanel';
import { useUserHasAnyRole } from '@/context/AuthContext';
import { ADMIN_ROLES } from '@/types/role';

export default function Navigation() {
	const location = useLocation();
	const navItems = [
		{ path: '/', label: 'Dashboard' },
		{ path: '/alerts', label: 'Alerts' },
		{ path: '/municipalities', label: 'Municipalities' },
	];
	const adminNavItems = [{ path: '/users', label: 'Users' }];

	const showAdmin = useUserHasAnyRole(ADMIN_ROLES);
	const displayedNavItems = showAdmin ? [...navItems, ...adminNavItems] : navItems;

	return (
		<nav className="bg-[#164273] shadow-lg">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Logo withText className="mx-auto mb-6" />
						<Link to="/" className="text-white text-xl font-bold">
							DRCCS
						</Link>
					</div>
					<div className="flex items-center space-x-8">
						{displayedNavItems.map(item => (
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
						<NotificationPanel />
						<AccountPanel />
					</div>
				</div>
			</div>
		</nav>
	);
}
