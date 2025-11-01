import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import { routes } from '@/routes';
import { useDepartment, useDeleteDepartment } from '@/hooks/useDepartment';
import DepartmentForm from '@/components/forms/DepartmentForm';
import DepartmentView from '@/components/views/DepartmentView';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/toast/ToastProvider';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import type { Department } from '@/types/department';
import AuthGuard from '@/components/auth/AuthGuard';
import { MUNICIPALITY_ROLES, REGION_ROLES } from '@/types/role';

export default function DepartmentPage() {
	const { departmentId } = useParams<{ departmentId?: string }>();
	const isNewDepartment = departmentId === undefined;
	const deptId = departmentId ? Number(departmentId) : undefined;

	return (
		<AuthGuard
			requireRoles={[...REGION_ROLES, ...MUNICIPALITY_ROLES]}
			requireAccessToDepartment={deptId}
		>
			<DepartmentPageContent departmentId={deptId} isNewDepartment={isNewDepartment} />
		</AuthGuard>
	);
}

function DepartmentPageContent({
	departmentId,
	isNewDepartment,
}: {
	departmentId?: number | undefined;
	isNewDepartment: boolean;
}) {
	const navigate = useNavigate();
	const location = useLocation() as { state?: { municipalityId?: number } };
	const { showSuccess, showError } = useToast();
	const auth = useAuth();
	const showSingleError = useSingleErrorToast();

	const { department, loading, error, refetch } = useDepartment(departmentId, {
		enabled: departmentId !== undefined,
	});

	const muniIdFromDept = department?.municipalityId;
	const muniIdFromState = location?.state?.municipalityId;
	const muniIdForActions =
		muniIdFromDept ?? muniIdFromState ?? auth?.user?.municipalityId ?? undefined;
	const deleteMutation = useDeleteDepartment();

	const [editing, setEditing] = useState(isNewDepartment);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	useEffect(() => {
		if (!isNewDepartment && departmentId === undefined) {
			navigate(muniIdForActions ? routes.departments(muniIdForActions) : routes.departments());
		}
	}, [departmentId, navigate, isNewDepartment, muniIdForActions]);

	useEffect(() => {
		if (!isNewDepartment && department) {
			setEditing(false);
		}
	}, [department, isNewDepartment]);

	useEffect(() => {
		showSingleError({
			key: `department.${departmentId ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load department.',
		});
	}, [error, loading, departmentId, showSingleError]);

	const handleDelete = () => {
		if (!department) return;
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!department) return;
		const departmentId = department.departmentId;
		const municipalityId = department.municipalityId;
		const departmentName = department.name;

		try {
			navigate(routes.departments(municipalityId), { replace: true });

			await deleteMutation.mutateAsync({
				id: departmentId,
				municipalityId: municipalityId,
			});
			showSuccess(`Department "${departmentName}" deleted successfully.`);
		} catch {
			showError('An unexpected error occurred while deleting.');
		}
		setShowDeleteModal(false);
	};

	const handleCancel = () => {
		if (isNewDepartment) {
			navigate(muniIdForActions ? routes.departments(muniIdForActions) : routes.departments());
		} else {
			setEditing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					{loading && <LoadingPanel />}
					{error && !loading && (
						<ErrorRetryBlock message="Unable to load department." onRetry={() => refetch()} />
					)}
					{editing || isNewDepartment ? (
						<DepartmentForm
							{...(department && { initialData: department })}
							isNewDepartment={isNewDepartment}
							municipalityId={muniIdForActions ?? -1}
							onCancel={handleCancel}
							onSuccess={(dept: Department | undefined) => {
								if (isNewDepartment) {
									showSuccess(`Department "${dept?.name}" created successfully!`);
									navigate(
										muniIdForActions ? routes.departments(muniIdForActions) : routes.departments()
									);
								} else {
									showSuccess(`Department "${dept?.name}" updated successfully!`);
									setEditing(false);
								}
							}}
							onFailure={(err?: unknown) => {
								const apiErr = err as { message?: string } | undefined;
								if (!apiErr?.message) return;
								showError(apiErr.message);
							}}
						/>
					) : (
						<DepartmentView
							department={department!}
							onEdit={() => setEditing(true)}
							onDelete={handleDelete}
							onBack={() =>
								navigate(
									muniIdForActions ? routes.departments(muniIdForActions) : routes.departments()
								)
							}
						/>
					)}
				</div>
			</div>
			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				title="Delete Department"
				message={`Are you sure you want to delete "${department?.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				onConfirm={confirmDelete}
				onCancel={() => setShowDeleteModal(false)}
			/>
		</div>
	);
}
