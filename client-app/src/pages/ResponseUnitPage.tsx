import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useResponseUnit, useDeleteResponseUnit } from '@/hooks/useResponseUnit';
import { routes } from '@/routes';
import ResponseUnitForm from '@/components/forms/ResponseUnitForm';
import ResponseUnitView from '@/components/views/ResponseUnitView';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/toast/ToastProvider';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import AuthGuard from '@/components/auth/AuthGuard';
import { DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES, createRoles } from '@/types/role';

export default function ResponseUnitPage() {
	const { responseUnitId } = useParams<{ responseUnitId?: string }>();
	const isNewResponseUnit = responseUnitId === undefined || responseUnitId === 'new';
	const unitId = responseUnitId ? Number(responseUnitId) : undefined;

	return (
		<AuthGuard
			requireRoles={createRoles([...REGION_ROLES, ...MUNICIPALITY_ROLES, ...DEPARTMENT_ROLES])}
		>
			<ResponseUnitPageContent responseUnitId={unitId} isNewResponseUnit={isNewResponseUnit} />
		</AuthGuard>
	);
}

function ResponseUnitPageContent({
	responseUnitId,
	isNewResponseUnit,
}: {
	responseUnitId?: number | undefined;
	isNewResponseUnit: boolean;
}) {
	const navigate = useNavigate();
	const location = useLocation();
	const { showSuccess, showError } = useToast();
	const showSingleError = useSingleErrorToast();
	const auth = useAuth();

	// Check if we're on an edit route
	const isEditRoute = location.pathname.includes('/edit');

	const {
		data: responseUnit,
		isLoading: loading,
		error,
		refetch,
	} = useResponseUnit(responseUnitId, {
		enabled: responseUnitId !== undefined,
	});

	const deptIdFromUnit = responseUnit?.departmentId;
	const deptIdFromState = (location?.state as { departmentId?: number })?.departmentId;
	const fallbackDepartmentId = (auth?.user?.roles ?? [])
		.map(r => r.departmentId)
		.find((id): id is number => typeof id === 'number');
	const departmentIdForActions =
		deptIdFromUnit ?? deptIdFromState ?? fallbackDepartmentId ?? undefined;
	const deleteMutation = useDeleteResponseUnit();

	// Initialize editing state: true for new units OR edit routes
	const [editing, setEditing] = useState(isNewResponseUnit || isEditRoute);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	useEffect(() => {
		if (
			!isNewResponseUnit &&
			(responseUnitId === undefined ||
				(responseUnitId !== undefined && isNaN(Number(responseUnitId))))
		) {
			if (departmentIdForActions !== undefined) {
				navigate(routes.resources(departmentIdForActions));
			} else {
				navigate(routes.resources());
			}
		}
	}, [isNewResponseUnit, responseUnitId, navigate, departmentIdForActions]);

	useEffect(() => {
		if (!isNewResponseUnit && responseUnit && !isEditRoute) {
			setEditing(false);
		}
	}, [responseUnit, isNewResponseUnit, isEditRoute]);

	useEffect(() => {
		showSingleError({
			key: `responseUnit.${responseUnitId ?? 'new'}`,
			error: error?.message || null,
			loading,
			message: 'Unable to load response unit.',
		});
	}, [error, loading, responseUnitId, showSingleError]);

	const handleDelete = () => {
		if (!responseUnit) return;
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!responseUnit) return;
		const unitId = responseUnit.unitId;
		const departmentId = responseUnit.departmentId;
		const unitName = responseUnit.unitName;

		try {
			navigate(routes.resources(departmentId), { replace: true });

			await deleteMutation.mutateAsync(unitId);
			showSuccess(`Response Unit "${unitName}" has been deleted successfully.`);
		} catch {
			showError('An unexpected error occurred while deleting.');
		}
		setShowDeleteModal(false);
	};

	const handleCancel = () => {
		if (isNewResponseUnit) {
			// For new units, go back to resources page
			if (departmentIdForActions !== undefined) {
				navigate(routes.resources(departmentIdForActions));
			} else {
				navigate(routes.resources());
			}
		} else if (isEditRoute && responseUnit) {
			// For edit routes, go back to details page
			navigate(routes.responseUnit(responseUnit.unitId));
		} else {
			// For other cases, just switch to view mode
			setEditing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					{loading && <LoadingPanel text="Loading response unit..." />}

					{error && !loading && (
						<ErrorRetryBlock message="Unable to load response unit." onRetry={() => refetch()} />
					)}

					{!loading && !error && (
						<div className="flex items-start space-x-6">
							<div className="flex-1">
								{!editing && responseUnit ? (
									<ResponseUnitView
										responseUnit={responseUnit}
										onEdit={() => setEditing(true)}
										onDelete={handleDelete}
										onBack={() =>
											departmentIdForActions !== undefined
												? navigate(routes.resources(departmentIdForActions))
												: navigate(routes.resources())
										}
									/>
								) : (
									<ResponseUnitForm
										{...(responseUnit && { initialData: responseUnit })}
										departmentId={Number(departmentIdForActions ?? -1)}
										onCancel={handleCancel}
										onSaved={() => {
											if (isEditRoute && responseUnit) {
												// For edit routes, go back to details page after save
												navigate(routes.responseUnit(responseUnit.unitId));
											} else {
												// For other cases, switch to view mode
												setEditing(false);
											}
										}}
										onRefetch={() => refetch()}
									/>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			<ConfirmModal
				isOpen={showDeleteModal}
				title="Delete Response Unit"
				message={`Are you sure you want to delete "${responseUnit?.unitName}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				onConfirm={confirmDelete}
				onCancel={() => setShowDeleteModal(false)}
			/>
		</div>
	);
}
