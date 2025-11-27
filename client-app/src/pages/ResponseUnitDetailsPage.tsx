import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useResponseUnit, useDeleteResponseUnit } from '@/hooks/useResponseUnit';
import { useUsersByDepartment } from '@/hooks/useUser';
import { useResources } from '@/hooks/useResource';
import { routes } from '@/routes';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/components/toast/ToastProvider';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import { DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES, createRoles } from '@/types/role';
import type { ResponseUnit } from '@/types/responseUnit';
import type { User } from '@/types/user';
import type { Resource } from '@/types/resource';

export default function ResponseUnitDetailsPage() {
	const { unitId } = useParams<{ unitId: string }>();
	const responseUnitId = unitId ? Number(unitId) : undefined;

	return (
		<AuthGuard
			requireRoles={createRoles([...REGION_ROLES, ...MUNICIPALITY_ROLES, ...DEPARTMENT_ROLES])}
		>
			<ResponseUnitDetailsPageContent responseUnitId={responseUnitId} />
		</AuthGuard>
	);
}

function ResponseUnitDetailsPageContent({
	responseUnitId,
}: {
	responseUnitId?: number | undefined;
}) {
	const navigate = useNavigate();
	const location = useLocation() as { state?: { departmentId?: number } };
	const { showSuccess, showError } = useToast();
	const showSingleError = useSingleErrorToast();
	const auth = useAuth();

	const {
		data: responseUnit,
		isLoading: loading,
		error,
		refetch,
	} = useResponseUnit(responseUnitId, {
		enabled: responseUnitId !== undefined,
	});

	const deleteMutation = useDeleteResponseUnit();
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const deptIdFromUnit = responseUnit?.departmentId;
	const deptIdFromState = location?.state?.departmentId;
	const fallbackDepartmentId = (auth?.user?.roles ?? [])
		.map(r => r.departmentId)
		.find((id): id is number => typeof id === 'number');
	const departmentIdForActions =
		deptIdFromUnit ?? deptIdFromState ?? fallbackDepartmentId ?? undefined;

	// Fetch department users and resources for displaying names instead of IDs
	const { users: departmentUsers } = useUsersByDepartment(departmentIdForActions, {
		enabled: !!departmentIdForActions,
	});
	const { resources: departmentResources } = useResources(departmentIdForActions, {
		enabled: !!departmentIdForActions,
	});

	// Show single error toast for loading issues
	showSingleError({
		key: `responseUnit.${responseUnitId ?? 'unknown'}`,
		error: error?.message || null,
		loading,
		message: 'Unable to load response unit.',
	});

	const handleEdit = () => {
		if (!responseUnit) return;
		navigate(routes.responseUnitEdit(responseUnit.unitId), {
			state: { departmentId: departmentIdForActions },
		});
	};

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

	const handleBack = () => {
		if (departmentIdForActions !== undefined) {
			navigate(routes.resources(departmentIdForActions));
		} else {
			navigate(routes.resources());
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow-md p-6">
						<LoadingPanel text="Loading response unit..." />
					</div>
				</div>
			</div>
		);
	}

	if (error && !loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow-md p-6">
						<ErrorRetryBlock message="Unable to load response unit." onRetry={() => refetch()} />
					</div>
				</div>
			</div>
		);
	}

	if (!responseUnit) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="text-center py-8">
							<p className="text-gray-600">Response unit not found.</p>
							<Button onClick={handleBack} variant="outline" className="mt-4">
								Go Back
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-start space-x-6">
						<div className="flex-1">
							<ResponseUnitDetailsView
								responseUnit={responseUnit}
								departmentUsers={departmentUsers || []}
								departmentResources={departmentResources || []}
								onEdit={handleEdit}
								onDelete={handleDelete}
								onBack={handleBack}
							/>
						</div>
					</div>
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

interface ResponseUnitDetailsViewProps {
	responseUnit: ResponseUnit;
	departmentUsers: User[];
	departmentResources: Resource[];
	onEdit: () => void;
	onDelete: () => void;
	onBack: () => void;
}

function ResponseUnitDetailsView({
	responseUnit,
	departmentUsers,
	departmentResources,
	onEdit,
	onDelete,
	onBack,
}: ResponseUnitDetailsViewProps) {
	const defaultPersonnelCount = responseUnit.defaultPersonnel?.length ?? 0;
	const defaultResourceCount = responseUnit.defaultResources?.length ?? 0;
	const currentPersonnelCount = responseUnit.currentPersonnel?.length ?? 0;
	const currentResourceCount = responseUnit.currentResources?.length ?? 0;

	// Helper functions to get names instead of IDs
	const getUserName = (userId: number) => {
		if (!departmentUsers || departmentUsers.length === 0) {
			return `User ID: ${userId}`;
		}
		const user = departmentUsers.find(u => u.userId === userId);
		return user ? `${user.firstName} ${user.lastName}` : `User ID: ${userId}`;
	};

	const getResourceName = (resourceId: number) => {
		if (!departmentResources || departmentResources.length === 0) {
			return `Resource ID: ${resourceId}`;
		}
		const resource = departmentResources.find(r => r.resourceId === resourceId);
		return resource ? resource.name : `Resource ID: ${resourceId}`;
	};

	return (
		<div className="relative">
			<div className="flex items-start justify-between mb-6">
				<div className="flex-1">
					<h2 className="text-3xl font-bold text-gray-900 mb-4">{responseUnit.unitName}</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
						<div className="space-y-2">
							<p><strong>Unit Type:</strong> {responseUnit.unitType}</p>
							<p><strong>Status:</strong> {responseUnit.status}</p>
							<p><strong>Default Personnel:</strong> {defaultPersonnelCount}</p>
							<p><strong>Default Resources:</strong> {defaultResourceCount}</p>
						</div>
						<div className="space-y-2">
							<p><strong>Current Personnel:</strong> {currentPersonnelCount}</p>
							<p><strong>Current Resources:</strong> {currentResourceCount}</p>
							{responseUnit.latitude && responseUnit.longitude && (
								<>
									<p><strong>Latitude:</strong> {responseUnit.latitude}</p>
									<p><strong>Longitude:</strong> {responseUnit.longitude}</p>
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Default Resources */}
			{responseUnit.defaultResources && responseUnit.defaultResources.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Default Resources</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.defaultResources.map(resource => (
							<div key={resource.resourceId} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
								<h4 className="text-sm font-medium text-gray-900 mb-2">{getResourceName(resource.resourceId)}</h4>
								<div className="space-y-1 text-sm text-gray-600">
									<p><strong>Quantity:</strong> {resource.quantity}</p>
									{resource.isPrimary && (
										<p className="text-blue-600 font-medium">Primary Resource</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Default Personnel */}
			{responseUnit.defaultPersonnel && responseUnit.defaultPersonnel.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Default Personnel</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.defaultPersonnel.map((person, index) => (
							<div key={person.userId || index} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									{person.userId ? getUserName(person.userId) : 'Open Position'}
								</h4>
								<div className="space-y-1 text-sm text-gray-600">
									<p><strong>Specialization:</strong> {person.specialization}</p>
									{person.isRequired && (
										<p className="text-red-600 font-medium">Required</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Current Resources (if different from defaults) */}
			{responseUnit.currentResources && responseUnit.currentResources.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Current Resources</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.currentResources.map(resource => (
							<div key={resource.resourceId} className="bg-blue-50 rounded-lg shadow-md p-4 border border-blue-200">
								<h4 className="text-sm font-medium text-gray-900 mb-2">{getResourceName(resource.resourceId)}</h4>
								<div className="space-y-1 text-sm text-gray-600">
									<p><strong>Quantity:</strong> {resource.quantity}</p>
									{resource.isPrimary && (
										<p className="text-blue-600 font-medium">Primary Resource</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Current Personnel (if different from defaults) */}
			{responseUnit.currentPersonnel && responseUnit.currentPersonnel.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Current Personnel</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.currentPersonnel.map(person => (
							<div key={person.userId} className="bg-blue-50 rounded-lg shadow-md p-4 border border-blue-200">
								<h4 className="text-sm font-medium text-gray-900 mb-2">{getUserName(person.userId)}</h4>
								<div className="space-y-1 text-sm text-gray-600">
									<p><strong>Specialization:</strong> {person.specialization}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="flex justify-end w-full space-x-3 mt-6">
				<Button onClick={onBack} variant="outline">
					Back
				</Button>
				<Button onClick={onEdit} variant="primary">
					Edit
				</Button>
				<Button onClick={onDelete} variant="danger">
					Delete
				</Button>
			</div>
		</div>
	);
}
