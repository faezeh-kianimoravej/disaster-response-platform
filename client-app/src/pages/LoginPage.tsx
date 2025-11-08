import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLogin } from '@/hooks/useLogin';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/routes';
import { REGION_ROLES, MUNICIPALITY_ROLES, DEPARTMENT_ROLES, type RoleType } from '@/types/role';

function getDefaultLandingPage(userRoles: RoleType[]): string {
	const hasRegionRole = REGION_ROLES.some(role => userRoles.includes(role));
	const hasMunicipalityRole = MUNICIPALITY_ROLES.some(role => userRoles.includes(role));
	const hasDepartmentRole = DEPARTMENT_ROLES.some(role => userRoles.includes(role));

	// Prioritize operational roles over pure admin roles
	if (hasRegionRole) return routes.dashboard();
	if (hasMunicipalityRole) return routes.departments();
	if (hasDepartmentRole) return routes.resources();

	// Fallback to home if no recognized roles
	return routes.home();
}

export default function LoginPage() {
	const { login, loading, error } = useLogin();
	const auth = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const location = useLocation() as unknown as { state?: { from?: { pathname?: string } } };

	// Redirect already logged-in users to their default landing page
	useEffect(() => {
		if (auth?.user && auth.isLoggedIn) {
			const userRoles = auth.user.roles?.map(r => r.roleType) ?? [];
			const defaultPage = getDefaultLandingPage(userRoles);
			navigate(defaultPage, { replace: true });
		}
	}, [auth, navigate]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		const user = await login(email, password);
		if (user) {
			const userRoles = user.roles?.map(r => r.roleType) ?? [];
			const defaultPage = getDefaultLandingPage(userRoles);
			const redirectTo = location.state?.from?.pathname ?? defaultPage;
			navigate(redirectTo, { replace: true });
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
			<div className="w-full max-w-md bg-white rounded-lg shadow p-6">
				<h1 className="text-2xl font-bold mb-4 text-gray-900">Log in</h1>
				<form onSubmit={onSubmit} className="space-y-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
							Email
						</label>
						<input
							id="email"
							type="email"
							className="mt-1 block w-full border rounded px-3 py-2"
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							autoComplete="email"
						/>
					</div>
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
							Password
						</label>
						<input
							id="password"
							type="password"
							className="mt-1 block w-full border rounded px-3 py-2"
							value={password}
							onChange={e => setPassword(e.target.value)}
							required
							autoComplete="current-password"
						/>
					</div>

					{error && (
						<div role="alert" className="text-sm text-red-600" aria-live="polite">
							{error}
						</div>
					)}

					<div className="flex items-center justify-between">
						<button
							type="submit"
							disabled={loading}
							className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
						>
							{loading ? 'Signing in…' : 'Sign in'}
						</button>
						<Link to={routes.home()} className="text-sm text-gray-600 hover:text-gray-900">
							Cancel
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
