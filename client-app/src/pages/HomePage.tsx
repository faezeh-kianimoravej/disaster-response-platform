import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/routes';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { REGION_ROLES, MUNICIPALITY_ROLES, DEPARTMENT_ROLES, type RoleType } from '@/types/role';
import { useKeycloak } from '@/context/KeycloakProvider';

function getDefaultLandingPage(userRoles: RoleType[]): string {
	const hasRegionRole = REGION_ROLES.some(role => userRoles.includes(role));
	const hasMunicipalityRole = MUNICIPALITY_ROLES.some(role => userRoles.includes(role));
	const hasDepartmentRole = DEPARTMENT_ROLES.some(role => userRoles.includes(role));

	if (hasRegionRole) return routes.dashboard();
	if (hasMunicipalityRole) return routes.departments();
	if (hasDepartmentRole) return routes.resources();

	return routes.home();
}

export default function HomePage() {
	const auth = useAuth();
	const navigate = useNavigate();
	const { isAuthenticated, login } = useKeycloak();

	const userRoles = auth?.user?.roles?.map(r => r.roleType) ?? [];
	const defaultPage = getDefaultLandingPage(userRoles);

	// Get user's name or email for personalization
	const userName =
		auth?.user?.firstName && auth.user.firstName.trim()
			? `${auth.user.firstName} ${auth.user.lastName || ''}`.trim()
			: auth?.user?.email || 'User';

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="max-w-2xl w-full text-center">
				<div className="bg-white rounded-2xl shadow-xl p-12">
					{/* Logo */}
					<div className="mb-8">
						<Logo />
					</div>

					{/* Welcome message */}
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Welcome to Disaster Response Coordination and Communication System (DRCCS)
					</h1>
					<p className="text-lg text-gray-600 mb-8">
						Coordinating emergency services across regions, municipalities, and departments to
						ensure rapid response and efficient resource management.
					</p>

					{/* Login link or personalized message */}
					{isAuthenticated ? (
						<div className="space-y-4">
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
								<p className="text-xl font-semibold text-blue-900 mb-2">
									Welcome back, {userName}!
								</p>
								<p className="text-gray-600 mb-4">You are currently logged in.</p>
								<Button
									onClick={() => navigate(defaultPage)}
									className="font-semibold px-8 py-3 shadow-md hover:shadow-lg"
								>
									Go to Your Dashboard
								</Button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<Button onClick={login} className="font-semibold px-8 py-3 shadow-md hover:shadow-lg">
								Sign In to Continue
							</Button>
							<p className="text-sm text-gray-500">
								Access your emergency response dashboard and manage incidents
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
