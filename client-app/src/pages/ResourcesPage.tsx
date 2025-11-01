import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/routes';
import { useResources } from '@/hooks/useResource';
import { useDepartment } from '@/hooks/useDepartment';
import Button from '@/components/ui/Button';
import { RESOURCE_TYPES, getDisplayImageSrc } from '@/utils/resourceUtils';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import AuthGuard from '@/components/auth/AuthGuard';
import { DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES } from '@/types/role';
import { useAuth, useUserHasAnyRole } from '@/context/AuthContext';

export default function ResourcesPage() {
	const { departmentId } = useParams<{ departmentId?: string }>();
	const auth = useAuth();
	const paramId = departmentId ? Number(departmentId) : undefined;
	const effectiveId = paramId ?? auth?.user?.departmentId ?? undefined;

	return (
		<AuthGuard
			requireRoles={[...REGION_ROLES, ...MUNICIPALITY_ROLES, ...DEPARTMENT_ROLES]}
			requireAccessToDepartment={effectiveId}
		>
			<ResourcesPageContent departmentId={effectiveId} />
		</AuthGuard>
	);
}

function ResourcesPageContent({
	departmentId,
}: {
	departmentId?: number | undefined;
}): JSX.Element {
	const navigate = useNavigate();
	const showSingleError = useSingleErrorToast();

	const { resources, loading, refetch, error } = useResources(departmentId, {
		enabled: !!departmentId,
	});

	const { department } = useDepartment(departmentId ?? undefined, { enabled: !!departmentId });

	useEffect(() => {
		showSingleError({
			key: `resources.${departmentId ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load resources.',
		});
	}, [error, loading, departmentId, showSingleError]);

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
					<div className="flex space-x-3">
						{useUserHasAnyRole([...REGION_ROLES, ...MUNICIPALITY_ROLES]) && (
							<Button
								onClick={() => {
									if (department?.municipalityId !== undefined) {
										navigate(routes.departments(department.municipalityId));
									} else {
										navigate(routes.departments());
									}
								}}
								variant="outline"
							>
								Back
							</Button>
						)}
						{departmentId !== undefined && (
							<Button
								onClick={() => navigate(routes.resourceNew(), { state: { departmentId } })}
								variant="primary"
							>
								Add New Resource
							</Button>
						)}
					</div>
				</div>

				<section aria-busy={loading} aria-live="polite">
					{loading && <LoadingPanel text="Loading resources..." />}

					{error && !loading && (
						<div className="mb-6">
							<ErrorRetryBlock message="Unable to load resources." onRetry={() => refetch()} />
						</div>
					)}

					{!loading && !error && (
						<>
							{resources.length === 0 ? (
								<p className="text-center text-gray-600">No resources available.</p>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{resources.map(r => (
										<Link
											key={r.resourceId}
											to={routes.resource(r.resourceId)}
											className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
										>
											{getDisplayImageSrc(r.image) && (
												<img
													src={getDisplayImageSrc(r.image)}
													alt={r.name}
													className="h-24 w-24 object-contain mx-auto mb-4"
												/>
											)}
											<h3 className="text-lg font-semibold text-gray-800 mb-2">{r.name}</h3>
											<p className="text-sm text-gray-500 mb-2">{r.description}</p>
											<p className="text-gray-700">
												<strong>Quantity:</strong> {r.quantity}
											</p>
											<p className="text-gray-700">
												<strong>Available:</strong> {r.available}
											</p>
											<p className="text-gray-700">
												<strong>Type:</strong>{' '}
												{RESOURCE_TYPES[r.resourceType as keyof typeof RESOURCE_TYPES]}
											</p>
										</Link>
									))}
								</div>
							)}
						</>
					)}
				</section>
			</div>
		</div>
	);
}
