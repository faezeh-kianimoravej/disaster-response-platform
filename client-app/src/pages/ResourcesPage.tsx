import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/routes';
import { useResources } from '@/hooks/useResource';
import { useDepartment } from '@/hooks/useDepartment';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import { getImageForResourceType } from '@/utils/resourceUtils';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import AuthGuard from '@/components/auth/AuthGuard';
import { DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES, createRoles } from '@/types/role';
import { useAuth, useUserHasAnyRole } from '@/context/AuthContext';
import ResponseUnitsOverview from '@/components/views/ResponseUnitsOverview';

export default function ResourcesPage() {
	const { departmentId } = useParams<{ departmentId?: string }>();
	const auth = useAuth();
	const paramId = departmentId ? Number(departmentId) : undefined;
	const fallbackDepartmentId = (auth?.user?.roles ?? [])
		.map(r => r.departmentId)
		.find((id): id is number => typeof id === 'number');
	const effectiveId = paramId ?? fallbackDepartmentId ?? undefined;

	return (
		<AuthGuard
			requireRoles={createRoles([...REGION_ROLES, ...MUNICIPALITY_ROLES, ...DEPARTMENT_ROLES])}
			requireAccessToDepartment={effectiveId}
		>
			<ResourcesPageContent departmentId={effectiveId} />
		</AuthGuard>
	);
}

// ResponseUnitsOverview moved to a separate view component in components/views

function ResourcesPageContent({
	departmentId,
}: {
	departmentId?: number | undefined;
}): JSX.Element {
	const navigate = useNavigate();
	const showSingleError = useSingleErrorToast();
	const [activeTab, setActiveTab] = useState<'resources' | 'responseUnits'>('resources');

	// Navigation handlers for Response Units
	const handleCreateResponseUnit = () => {
		navigate(routes.responseUnitNew(), {
			state: { departmentId },
		});
	};

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
						{useUserHasAnyRole(createRoles([...REGION_ROLES, ...MUNICIPALITY_ROLES])) && (
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
					</div>
				</div>

				<Tabs
					tabs={[
						{ key: 'resources', label: 'Resources' },
						{ key: 'responseUnits', label: 'Response Units' },
					]}
					activeKey={activeTab}
					onChange={key => setActiveTab(key as 'resources' | 'responseUnits')}
				/>

				{activeTab === 'resources' && (
					<section aria-busy={loading} aria-live="polite">
						<div className="flex items-center justify-between mb-6">
							<p className="text-gray-600">Manage and assign resources for this department.</p>
							{departmentId !== undefined && (
								<Button
									onClick={() => navigate(routes.resourceNew(), { state: { departmentId } })}
									variant="primary"
								>
									Add New Resource
								</Button>
							)}
						</div>
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
												<img
													src={getImageForResourceType(r.resourceType)}
													alt={r.name}
													className="h-24 w-24 object-contain mx-auto mb-4"
												/>
												<h3 className="text-lg font-semibold text-gray-800 mb-2 normal-case">
													{r.name}
												</h3>
												<p className="text-sm text-gray-500 mb-2 normal-case">{r.description}</p>
												<p className="text-gray-700 normal-case">
													<strong>Category:</strong> {r.category}
												</p>
												<p className="text-gray-700 normal-case">
													<strong>Kind:</strong> {r.resourceKind}
												</p>
												<p className="text-gray-700 normal-case">
													<strong>Status:</strong> {r.status}
												</p>
												<p className="text-gray-700 normal-case">
													<strong>Total Quantity:</strong> {r.totalQuantity ?? '-'}
												</p>
												<p className="text-gray-700 normal-case">
													<strong>Available:</strong> {r.availableQuantity ?? '-'}
												</p>
												<p className="text-gray-700 normal-case">
													<strong>Type:</strong> {r.resourceType}
												</p>
											</Link>
										))}
									</div>
								)}
							</>
						)}
					</section>
				)}

				{activeTab === 'responseUnits' && (
					<section aria-live="polite" aria-busy={false}>
						<div className="flex items-center justify-between mb-6">
							<p className="text-gray-600">
								Manage and define response units for this department here.
							</p>
							{departmentId !== undefined && (
								<Button variant="primary" onClick={handleCreateResponseUnit}>
									Add Response Unit
								</Button>
							)}
						</div>
						{/** Fetch and display response units for this department */}
						{departmentId === undefined ? (
							<p className="text-gray-600">No department selected.</p>
						) : (
							<ResponseUnitsOverview departmentId={departmentId} />
						)}
					</section>
				)}
			</div>
		</div>
	);
}
