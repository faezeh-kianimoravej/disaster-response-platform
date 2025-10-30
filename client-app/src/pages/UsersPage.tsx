import { useEffect } from 'react';
import { useListUsers } from '@/hooks/useUser';
import { useIsUserLoggedIn, useUserHasAnyRole } from '@/context/AuthContext';
import NotAuthorizedPage from '@/pages/NotAuthorizedPage';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types/user';
import LoadingPanel from '@/components/LoadingPanel';

export default function UsersPage() {
	const isLoggedIn = useIsUserLoggedIn();
	const canView = useUserHasAnyRole(['Region Admin', 'Municipality Admin', 'Department Admin']);
	const { users, fetchUsers, loading, error } = useListUsers();
	const navigate = useNavigate();

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	if (!isLoggedIn || !canView) {
		return <NotAuthorizedPage />;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Users</h1>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					{loading ? (
						<LoadingPanel text="Loading users..." />
					) : (
						<>
							{error && <div className="text-red-600 mb-4">{error}</div>}
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
												onClick={() => navigate(`/users/${user.userId}`)}
											>
												<td className="px-4 py-2 text-sm text-gray-900">{user.userId}</td>
												<td className="px-4 py-2 text-sm text-gray-900">
													{user.firstName} {user.lastName}
												</td>
												<td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
												<td className="px-4 py-2 text-sm text-gray-700">{user.mobile}</td>
												<td className="px-4 py-2 text-sm">
													{user.roles.map(r => (
														<span
															key={r}
															className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-1 px-2.5 py-0.5 rounded"
														>
															{r}
														</span>
													))}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
