import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth, useUserHasAnyRole } from '@/context/AuthContext';
import { routes } from '@/routes';
import Button from '@/components/ui/Button';
import { MUNICIPALITY_ROLES, REGION_ROLES } from '@/types/role';
import { Edit } from 'lucide-react';
import type { Department } from '@/types/department';
import AuthGuard from '@/components/auth/AuthGuard';
import { useDepartments } from '@/hooks/useDepartment';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';

export default function DepartmentsPage() {
	const { municipalityId } = useParams<{ municipalityId?: string }>();
	const auth = useAuth();
	const paramId = municipalityId ? Number(municipalityId) : undefined;
	const effectiveId = paramId ?? auth?.user?.municipalityId ?? undefined;

	return (
		<AuthGuard
			requireRoles={[...REGION_ROLES, ...MUNICIPALITY_ROLES]}
			requireAccessToMunicipality={effectiveId}
		>
			<DepartmentsPageContent municipalityId={effectiveId} />
		</AuthGuard>
	);
}

function DepartmentsPageContent({
	municipalityId,
}: {
	municipalityId?: number | undefined;
}): JSX.Element {
	const navigate = useNavigate();

	const { departments, loading, error, refetch } = useDepartments(municipalityId, {
		enabled: municipalityId !== undefined,
	});
	const showSingleError = useSingleErrorToast();

	useEffect(() => {
		showSingleError({
			key: `departments.${municipalityId ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load departments.',
		});
	}, [error, loading, municipalityId, showSingleError]);

	const handleDepartmentClick = (departmentId: number) => {
		navigate(routes.resources(departmentId));
	};

	const handleEditClick = (e: React.MouseEvent, departmentId: number) => {
		e.stopPropagation();
		navigate(routes.department(departmentId));
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Departments</h1>
					<div className="flex space-x-3">
						{useUserHasAnyRole([...REGION_ROLES]) && (
							<Button onClick={() => navigate(routes.municipalities())} variant="outline">
								Back
							</Button>
						)}
						{municipalityId !== undefined && (
							<Button
								onClick={() => navigate(routes.departmentNew(), { state: { municipalityId } })}
							>
								Add Department
							</Button>
						)}
					</div>
				</div>

				<section aria-busy={loading} aria-live="polite">
					{loading && <LoadingPanel />}

					{error && !loading && (
						<div className="mb-6">
							<ErrorRetryBlock message="Unable to load departments." onRetry={() => refetch()} />
						</div>
					)}

					{!loading && !error && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{departments.length === 0 ? (
								<p className="text-gray-600">No departments found for this municipality.</p>
							) : (
								departments.map((d: Department) => (
									<div
										key={d.departmentId}
										onClick={() => handleDepartmentClick(d.departmentId)}
										className="relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
									>
										<button
											onClick={e => handleEditClick(e, d.departmentId)}
											className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
										>
											<Edit size={20} />
										</button>

										<img
											src={
												d.image
													? d.image.startsWith('data:')
														? d.image
														: `/images/${d.image || 'default.png'}`
													: '/images/default.png'
											}
											alt={d.name}
											className="h-24 w-24 object-contain mx-auto mb-4"
										/>
										<h3 className="text-lg font-semibold text-gray-800 text-center">{d.name}</h3>
									</div>
								))
							)}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
