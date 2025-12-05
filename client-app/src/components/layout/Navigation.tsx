import { NavLink } from 'react-router-dom';
import { routes } from '@/routes';
import Logo from '@/components/ui/Logo';
import NotificationPanel from '@/components/features/notifications/NotificationPanel';
import AccountPanel from '@/components/auth/AccountPanel';
import { useUserHasAnyRole, useIsUserLoggedIn } from '@/context/AuthContext';
import {
	ADMIN_ROLES,
	REGION_ROLES,
	MUNICIPALITY_ROLES,
	DEPARTMENT_ROLES,
	createRoles,
} from '@/types/role';

export default function Navigation() {
	const showAdmin = useUserHasAnyRole(createRoles([...ADMIN_ROLES]));
	const showRegion = useUserHasAnyRole(createRoles([...REGION_ROLES]));
	const showMunicipality = useUserHasAnyRole(createRoles([...MUNICIPALITY_ROLES]));
	const showDepartment = useUserHasAnyRole(createRoles([...DEPARTMENT_ROLES]));

	// Build nav items with role-based visibility
	const navItems = [
		...(showRegion
			? [
					{ path: routes.dashboard(), label: 'Dashboard' },
					{ path: routes.municipalities(), label: 'Municipalities' },
				]
			: []),
		...(showMunicipality ? [{ path: routes.departments(), label: 'Departments' }] : []),
		...(showDepartment ? [{ path: routes.resources(), label: 'Resources' }] : []),
		...(showAdmin ? [{ path: routes.users(), label: 'Users' }] : []),
		// Chat available for any logged-in user
		...(useIsUserLoggedIn() ? [{ path: routes.chat(), label: 'Chat' }] : []),
	];

	return (
		<nav className="bg-[#164273] shadow-lg">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Logo withText className="mx-auto mb-6" />
						<NavLink end to={routes.home()} className="text-white text-xl font-bold">
							DRCCS
						</NavLink>
					</div>
					<div className="flex items-center space-x-8">
						{navItems.map(item => (
							<NavLink
								key={item.path}
								to={item.path}
								className={({ isActive }) =>
									`text-white hover:text-blue-200 transition-colors ${
										isActive ? 'font-semibold border-b-2 border-blue-200' : ''
									}`
								}
							>
								{item.label}
							</NavLink>
						))}
						<NotificationPanel />
						<AccountPanel />
					</div>
				</div>
			</div>
		</nav>
	);
}
