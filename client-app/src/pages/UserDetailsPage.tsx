import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUser } from '@/hooks/useUser';
import Button from '@/components/Button';
import { useRegion } from '@/hooks/useRegion';
import { useDepartment } from '@/hooks/useDepartment';
import { useMunicipality } from '@/hooks/useMunicipality';
import LoadingPanel from '@/components/LoadingPanel';

export default function UserDetailsPage() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { fetchUser, user, loading, error } = useGetUser();

	const [entityName, setEntityName] = useState<string | null>(null);
	const [entityLabel, setEntityLabel] = useState<string | null>(null);

	const regionId = user?.regionId;
	const departmentId = user?.departmentId;
	const municipalityId = user?.municipalityId;

	const { fetchRegion } = useRegion();
	const { department, loading: departmentLoading } = useDepartment(
		departmentId ? String(departmentId) : undefined,
		false,
		municipalityId ?? 0
	);

	const { municipalities, municipality: fetchedMunicipality } = useMunicipality(municipalityId);
	const municipality =
		fetchedMunicipality ?? municipalities.find(m => m.municipalityId === municipalityId);

	useEffect(() => {
		if (userId) fetchUser(userId);
	}, [userId, fetchUser]);

	useEffect(() => {
		if (!user) {
			setEntityName(null);
			setEntityLabel(null);
			return;
		}
		if (regionId) {
			fetchRegion(regionId).then(r => {
				setEntityName(r?.name || null);
				setEntityLabel('Region');
			});
		} else if (departmentId) {
			if (!departmentLoading && department) {
				setEntityName(department.name);
				setEntityLabel('Department');
			} else {
				setEntityName(null);
				setEntityLabel(null);
			}
		} else if (municipalityId) {
			if (municipalities.length > 0 && municipality) {
				setEntityName(municipality.name);
				setEntityLabel('Municipality');
			} else {
				setEntityName(null);
				setEntityLabel(null);
			}
		} else {
			setEntityName(null);
			setEntityLabel(null);
		}
	}, [
		user,
		regionId,
		departmentId,
		municipalityId,
		department,
		departmentLoading,
		municipalities,
		municipality,
	]);

	//TODO: Fix retrieval of entity names based on user associations

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-2xl mx-auto px-4">
				<div className="bg-white rounded-xl shadow-lg p-8">
					{loading ? (
						<LoadingPanel text="Loading user..." />
					) : error ? (
						<div className="text-red-600 mb-4">{error}</div>
					) : user ? (
						<>
							<div className="flex items-center mb-6">
								<div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 mr-6">
									{user.firstName[0]}
									{user.lastName[0]}
								</div>
								<div>
									<h1 className="text-2xl font-bold text-gray-900 mb-1">
										{user.firstName} {user.lastName}
									</h1>
									<div className="flex flex-wrap gap-2">
										{user.roles.map(r => (
											<span
												key={r}
												className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
											>
												{r}
											</span>
										))}
									</div>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
								<div>
									<div className="text-gray-500 text-xs uppercase mb-1">Email</div>
									<div className="text-gray-900 font-medium">{user.email}</div>
								</div>
								<div>
									<div className="text-gray-500 text-xs uppercase mb-1">Mobile</div>
									<div className="text-gray-900 font-medium">{user.mobile}</div>
								</div>
								{entityName && entityLabel && (
									<div>
										<div className="text-gray-500 text-xs uppercase mb-1">{entityLabel}</div>
										<div className="text-gray-900 font-medium">{entityName}</div>
									</div>
								)}
							</div>
							<div className="flex flex-wrap gap-2 justify-end mt-8">
								<Button variant="outline" onClick={() => navigate(-1)}>
									Back
								</Button>
								<Button variant="primary" onClick={() => navigate(`/users/${userId}/edit`)}>
									Edit
								</Button>
								<Button
									variant="danger"
									onClick={() => {
										/* TODO: implement delete logic */
									}}
								>
									Delete
								</Button>
							</div>
						</>
					) : (
						<div className="text-gray-500">User not found.</div>
					)}
				</div>
			</div>
		</div>
	);
}
