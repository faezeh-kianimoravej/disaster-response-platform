import { useMemo, useEffect } from 'react';
import { useUsersByDepartment, useUsersByMunicipality, useUsersByRegion } from '@/hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import type { User } from '@/types/user';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import { ADMIN_ROLES } from '@/types/role';
import AuthGuard from '@/components/auth/AuthGuard';
import { useCurrentUserRoles } from '@/context/AuthContext';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';

export default function UsersPage() {
	return (
		<AuthGuard requireRoles={[...ADMIN_ROLES]}>
			<UsersPageContent />
		</AuthGuard>
	);
}

function UsersPageContent() {
	const navigate = useNavigate();

	// Current user's roles and derived admin entity ids (first match if multiple)
	const currentUserRoles = useCurrentUserRoles();
	const regionAdminId =
		currentUserRoles.find(r => r.roleType === 'Region Admin')?.regionId ?? undefined;
	const municipalityAdminId =
		currentUserRoles.find(r => r.roleType === 'Municipality Admin')?.municipalityId ?? undefined;
	const departmentAdminId =
		currentUserRoles.find(r => r.roleType === 'Department Admin')?.departmentId ?? undefined;

	// Load list of users the current scope has access to
	const {
		users: regionUsers,
		loading: loadingRegionUsers,
		error: regionError,
		refetch: refetchRegion,
	} = useUsersByRegion(regionAdminId, { enabled: !!regionAdminId });

	const {
		users: municipalityUsers,
		loading: loadingMunicipalityUsers,
		error: municipalityError,
		refetch: refetchMunicipality,
	} = useUsersByMunicipality(municipalityAdminId, { enabled: !!municipalityAdminId });

	const {
		users: departmentUsers,
		loading: loadingDepartmentUsers,
		error: departmentError,
		refetch: refetchDepartment,
	} = useUsersByDepartment(departmentAdminId, { enabled: !!departmentAdminId });

	// Choose which list to show based on the most specific admin scope available
	const { users, loading, error, refetch } = useMemo(() => {
		if (departmentAdminId) {
			return {
				users: departmentUsers,
				loading: loadingDepartmentUsers,
				error: departmentError,
				refetch: refetchDepartment,
			};
		}
		if (municipalityAdminId) {
			return {
				users: municipalityUsers,
				loading: loadingMunicipalityUsers,
				error: municipalityError,
				refetch: refetchMunicipality,
			};
		}
		if (regionAdminId) {
			return {
				users: regionUsers,
				loading: loadingRegionUsers,
				error: regionError,
				refetch: refetchRegion,
			};
		}
		return {
			users: [] as User[],
			loading: false,
			error: null as string | null,
			refetch: () => Promise.resolve(),
		};
	}, [
		departmentAdminId,
		municipalityAdminId,
		regionAdminId,
		departmentUsers,
		municipalityUsers,
		regionUsers,
		loadingDepartmentUsers,
		loadingMunicipalityUsers,
		loadingRegionUsers,
		departmentError,
		municipalityError,
		regionError,
		refetchDepartment,
		refetchMunicipality,
		refetchRegion,
	]);

	const showSingleError = useSingleErrorToast();
	useEffect(() => {
		const key = departmentAdminId
			? `users.department.${departmentAdminId}`
			: municipalityAdminId
				? `users.municipality.${municipalityAdminId}`
				: regionAdminId
					? `users.region.${regionAdminId}`
					: 'users.none';
		showSingleError({ key, error, loading, message: 'Unable to load users.' });
	}, [departmentAdminId, municipalityAdminId, regionAdminId, error, loading, showSingleError]);

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Users</h1>
					<button
						onClick={() => navigate(routes.userNew())}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
					>
						Create New User
					</button>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<section aria-busy={loading} aria-live="polite">
						{loading && <LoadingPanel text="Loading users..." />}

						{error && !loading && (
							<div className="mb-6">
								<ErrorRetryBlock message="Unable to load users." onRetry={() => refetch()} />
							</div>
						)}

						{!loading && !error && users.length === 0 && (
							<div className="text-center py-12">
								<p className="text-lg font-medium text-gray-900">No users found</p>
								<p className="mt-2 text-sm text-gray-600">
									There are no users in your current admin scope.
								</p>
								<div className="mt-6">
									<button
										onClick={() => navigate(routes.userNew())}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
									>
										Create your first user
									</button>
								</div>
							</div>
						)}

						{!loading && !error && users.length > 0 && (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-100">
										<tr>
											<th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												ID
											</th>
											<th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												Name
											</th>
											<th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												Email
											</th>
											<th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												Mobile
											</th>
											<th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
												Roles
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-100">
										{users.map((user: User) => (
											<tr
												key={user.userId}
												className="hover:bg-blue-50 transition cursor-pointer"
												onClick={() => navigate(routes.user(user.userId))}
											>
												<td className="px-4 py-2 text-sm text-gray-900">{user.userId}</td>
												<td className="px-4 py-2 text-sm text-gray-900">
													{user.firstName} {user.lastName}
												</td>
												<td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
												<td className="px-4 py-2 text-sm text-gray-700">{user.mobile}</td>
												<td className="px-4 py-2 text-sm">
													{user.roles.map((role, idx) => (
														<span
															key={idx}
															className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-1 px-2.5 py-0.5 rounded"
														>
															{role.roleType}
														</span>
													))}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>
				</div>
			</div>
		</div>
	);
}
