import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useResource } from '@/hooks/useResource';
import ResourceForm from '@/components/forms/ResourceForm';
import ResourceView from '@/components/views/ResourceView';
import ConfirmModal from '@/components/ConfirmModal';
import { getImageForResourceType } from '@/utils/resourceUtils';
import { type ResourceFormData } from '@/types/resource';
import { useToast } from '@/components/toast/ToastProvider';

export default function ResourcePage() {
	const { resourceId, departmentId } = useParams<{ resourceId: string; departmentId: string }>();
	const location = useLocation();
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();

	const { resource, loading, saveResource, removeResource } = useResource(
		resourceId,
		resourceId === 'new'
	);
	const [editing, setEditing] = useState(resourceId === 'new');
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [currentImageSrc, setCurrentImageSrc] = useState<string>(
		getImageForResourceType('FIELD_OPERATOR')
	);

	const municipalityIdFromState = location.state?.municipalityId;
	const [municipalityId, setMunicipalityId] = useState<number | null>(
		municipalityIdFromState || Number(localStorage.getItem('municipalityId')) || null
	);

	useEffect(() => {
		if (municipalityIdFromState) {
			localStorage.setItem('municipalityId', String(municipalityIdFromState));
			setMunicipalityId(municipalityIdFromState);
		}
	}, [municipalityIdFromState]);

	useEffect(() => {
		if (!resourceId || (isNaN(Number(resourceId)) && resourceId !== 'new')) {
			navigate(`/resources/${departmentId}`, { state: { municipalityId } });
		}
	}, [resourceId, navigate, departmentId, municipalityId]);

	useEffect(() => {
		if (resource) {
			setCurrentImageSrc(getImageForResourceType(resource.resourceType));
		} else if (resourceId === 'new') {
			setCurrentImageSrc(getImageForResourceType('FIELD_OPERATOR'));
		}
	}, [resource, resourceId]);

	const handleSave = async (formData: ResourceFormData) => {
		try {
			const savedResource = await saveResource({ ...formData, departmentId: Number(departmentId) });
			if (savedResource) {
				if (resourceId === 'new') {
					showSuccess(`Resource "${savedResource.name}" has been created successfully!`);
					navigate(`/resources/${departmentId}`, { state: { municipalityId } });
				} else {
					showSuccess(`Resource "${savedResource.name}" has been updated successfully!`);
					setEditing(false);
				}
			} else {
				showError('Failed to save resource. Please try again.');
			}
		} catch {
			showError('An unexpected error occurred while saving.');
		}
	};

	const handleDelete = () => {
		if (!resource) return;
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!resource) return;
		try {
			await removeResource();
			showSuccess(`Resource "${resource.name}" has been deleted successfully.`);
			navigate(`/resources/${departmentId}`, { state: { municipalityId } });
		} catch {
			showError('An unexpected error occurred while deleting.');
		}
		setShowDeleteModal(false);
	};

	const handleCancel = () => {
		if (resourceId === 'new') {
			navigate(`/resources/${departmentId}`, { state: { municipalityId } });
		} else {
			setEditing(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 text-center">Loading...</div>
			</div>
		);
	}

	if (!resource && resourceId !== 'new') {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<h2 className="text-2xl font-semibold">Resource not found</h2>
					<p className="mt-4">The requested resource was not found.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-start space-x-6">
						<img
							src={currentImageSrc}
							alt={
								editing || resourceId === 'new' ? 'Resource preview' : resource?.name || 'Resource'
							}
							className="h-32 w-32 object-contain"
						/>
						<div className="flex-1">
							{!editing && resource ? (
								<ResourceView
									resource={resource}
									onEdit={() => setEditing(true)}
									onDelete={handleDelete}
									onBack={() =>
										navigate(`/resources/${departmentId}`, { state: { municipalityId } })
									}
								/>
							) : (
								<ResourceForm
									{...(resource && { initialData: resource })}
									isNewResource={resourceId === 'new'}
									onSave={handleSave}
									onCancel={handleCancel}
									onImageChange={setCurrentImageSrc}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
			{/* Delete Confirmation Modal */}
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
