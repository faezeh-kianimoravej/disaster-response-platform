import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useResource, useDeleteResource } from '@/hooks/useResource';
import { routes } from '@/routes';
import ResourceForm from '@/components/forms/ResourceForm';
import ResourceView from '@/components/views/ResourceView';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/toast/ToastProvider';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import AuthGuard from '@/components/auth/AuthGuard';
import { DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES, createRoles } from '@/types/role';

export default function ResourcePage() {
	const { resourceId } = useParams<{ resourceId?: string }>();
	const isNewResource = resourceId === undefined || resourceId === 'new';
	const resId = resourceId ? Number(resourceId) : undefined;

	return (
		<AuthGuard
			requireRoles={createRoles([...REGION_ROLES, ...MUNICIPALITY_ROLES, ...DEPARTMENT_ROLES])}
			requireAccessToResource={resId}
		>
			<ResourcePageContent resourceId={resId} isNewResource={isNewResource} />
		</AuthGuard>
	);
}

function ResourcePageContent({
	resourceId,
	isNewResource,
}: {
	resourceId?: number | undefined;
	isNewResource: boolean;
}) {
	const navigate = useNavigate();
	const location = useLocation() as { state?: { departmentId?: number } };
	const { showSuccess, showError } = useToast();
	const showSingleError = useSingleErrorToast();
	const auth = useAuth();

	const { resource, loading, error, refetch } = useResource(resourceId, {
		enabled: resourceId !== undefined,
	});

	const deptIdFromResource = resource?.departmentId;
	const deptIdFromState = location?.state?.departmentId;
	const fallbackDepartmentId = (auth?.user?.roles ?? [])
		.map(r => r.departmentId)
		.find((id): id is number => typeof id === 'number');
	const departmentIdForActions =
		deptIdFromResource ?? deptIdFromState ?? fallbackDepartmentId ?? undefined;
	const deleteMutation = useDeleteResource();

	const [editing, setEditing] = useState(isNewResource);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	useEffect(() => {
		if (
			!isNewResource &&
			(resourceId === undefined || (resourceId !== undefined && isNaN(Number(resourceId))))
		) {
			if (departmentIdForActions !== undefined) {
				navigate(routes.resources(departmentIdForActions));
			} else {
				navigate(routes.resources());
			}
		}
	}, [isNewResource, resourceId, navigate, departmentIdForActions]);

	useEffect(() => {
		if (!isNewResource && resource) {
			setEditing(false);
		}
	}, [resource, isNewResource]);

	useEffect(() => {
		showSingleError({
			key: `resource.${resourceId ?? 'new'}`,
			error,
			loading,
			message: 'Unable to load resource.',
		});
	}, [error, loading, resourceId, showSingleError]);

	const handleDelete = () => {
		if (!resource) return;
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!resource) return;
		const resourceId = resource.resourceId;
		const departmentId = resource.departmentId;
		const resourceName = resource.name;

		try {
			navigate(routes.resources(departmentId), { replace: true });

			await deleteMutation.mutateAsync({
				id: resourceId,
				departmentId: departmentId,
			});
			showSuccess(`Resource "${resourceName}" has been deleted successfully.`);
		} catch {
			showError('An unexpected error occurred while deleting.');
		}
		setShowDeleteModal(false);
	};

	const handleCancel = () => {
		if (isNewResource) {
			if (departmentIdForActions !== undefined) {
				navigate(routes.resources(departmentIdForActions));
			} else {
				navigate(routes.resources());
			}
		} else setEditing(false);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					{loading && <LoadingPanel text="Loading resource..." />}

					{error && !loading && (
						<ErrorRetryBlock message="Unable to load resource." onRetry={() => refetch()} />
					)}

					{!loading && !error && (
						<div className="flex items-start space-x-6">
							<div className="flex-1">
								{!editing && resource ? (
									<ResourceView
										resource={resource}
										onEdit={() => setEditing(true)}
										onDelete={handleDelete}
										onBack={() =>
											departmentIdForActions !== undefined
												? navigate(routes.resources(departmentIdForActions))
												: navigate(routes.resources())
										}
									/>
								) : (
									<ResourceForm
										{...(resource && { initialData: resource })}
										isNewResource={isNewResource}
										departmentId={Number(departmentIdForActions ?? -1)}
										onCancel={handleCancel}
										onSaved={() => setEditing(false)}
									/>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			<ConfirmModal
				isOpen={showDeleteModal}
				title="Delete Resource"
				message={`Are you sure you want to delete "${resource?.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				onConfirm={confirmDelete}
				onCancel={() => setShowDeleteModal(false)}
			/>
		</div>
	);
}
