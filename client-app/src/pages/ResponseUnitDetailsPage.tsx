import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useResponseUnit, useDeleteResponseUnit } from '@/hooks/useResponseUnit';
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
	onEdit: () => void;
	onDelete: () => void;
	onBack: () => void;
}

function ResponseUnitDetailsView({
	responseUnit,
	onEdit,
	onDelete,
	onBack,
}: ResponseUnitDetailsViewProps) {
	const defaultPersonnelCount = responseUnit.defaultPersonnel?.length ?? 0;
	const defaultResourceCount = responseUnit.defaultResources?.length ?? 0;
	const currentPersonnelCount = responseUnit.currentPersonnel?.length ?? 0;
	const currentResourceCount = responseUnit.currentResources?.length ?? 0;

	return (
		<div className="relative">
			<div className="flex items-start space-x-6 mb-4">
				<div className="flex-1">
					<h2 className="text-2xl font-semibold pr-40">{responseUnit.unitName}</h2>
					<div className="mt-4 text-gray-700">
						<p>
							<strong>Unit Type:</strong> {responseUnit.unitType}
						</p>
						<p>
							<strong>Status:</strong> {responseUnit.status}
						</p>
						<p>
							<strong>Default Personnel Count:</strong> {defaultPersonnelCount}
						</p>
						<p>
							<strong>Default Resource Count:</strong> {defaultResourceCount}
						</p>
						<p>
							<strong>Current Personnel Count:</strong> {currentPersonnelCount}
						</p>
						<p>
							<strong>Current Resource Count:</strong> {currentResourceCount}
						</p>
						{responseUnit.latitude && responseUnit.longitude && (
							<div>
								<p>
									<strong>Latitude:</strong> {responseUnit.latitude}
								</p>
								<p>
									<strong>Longitude:</strong> {responseUnit.longitude}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Default Resources */}
			{responseUnit.defaultResources && responseUnit.defaultResources.length > 0 && (
				<div className="mb-6 bg-gray-50 rounded-lg p-4">
					<h3 className="text-lg font-medium mb-2">Default Resources</h3>
					<p className="text-sm text-gray-600 mb-4">Resources assigned by default to this unit</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{responseUnit.defaultResources.map(resource => (
							<div key={resource.resourceId} className="p-3 bg-white border rounded-lg">
								<div className="font-medium">Resource ID: {resource.resourceId}</div>
								<div className="text-sm text-gray-600">Quantity: {resource.quantity}</div>
								{resource.isPrimary && (
									<div className="text-sm text-blue-600 font-medium">Primary Resource</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Default Personnel */}
			{responseUnit.defaultPersonnel && responseUnit.defaultPersonnel.length > 0 && (
				<div className="mb-6 bg-gray-50 rounded-lg p-4">
					<h3 className="text-lg font-medium mb-2">Default Personnel</h3>
					<p className="text-sm text-gray-600 mb-4">Personnel assigned by default to this unit</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{responseUnit.defaultPersonnel.map(person => (
							<div key={person.userId} className="p-3 bg-white border rounded-lg">
								<div className="font-medium">User ID: {person.userId}</div>
								<div className="text-sm text-gray-600">Specialization: {person.specialization}</div>
								{person.isRequired && (
									<div className="text-sm text-red-600 font-medium">Required</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Current Resources (if different from defaults) */}
			{responseUnit.currentResources && responseUnit.currentResources.length > 0 && (
				<div className="mb-6 bg-blue-50 rounded-lg p-4">
					<h3 className="text-lg font-medium mb-2">Current Resources</h3>
					<p className="text-sm text-gray-600 mb-4">Resources currently assigned to this unit</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{responseUnit.currentResources.map(resource => (
							<div key={resource.resourceId} className="p-3 bg-white border rounded-lg">
								<div className="font-medium">Resource ID: {resource.resourceId}</div>
								<div className="text-sm text-gray-600">Quantity: {resource.quantity}</div>
								{resource.isPrimary && (
									<div className="text-sm text-blue-600 font-medium">Primary Resource</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Current Personnel (if different from defaults) */}
			{responseUnit.currentPersonnel && responseUnit.currentPersonnel.length > 0 && (
				<div className="mb-6 bg-blue-50 rounded-lg p-4">
					<h3 className="text-lg font-medium mb-2">Current Personnel</h3>
					<p className="text-sm text-gray-600 mb-4">Personnel currently assigned to this unit</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{responseUnit.currentPersonnel.map(person => (
							<div key={person.userId} className="p-3 bg-white border rounded-lg">
								<div className="font-medium">User ID: {person.userId}</div>
								<div className="text-sm text-gray-600">Specialization: {person.specialization}</div>
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
