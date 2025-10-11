import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useResource } from '@/hooks/useResource';
import ResourceForm from '@/components/forms/ResourceForm';
import ResourceView from '@/components/views/ResourceView';
import ConfirmModal from '@/components/ConfirmModal';
import { getImageForResourceType } from '@/utils/resourceUtils';
import { type ResourceFormData } from '@/types/resource';
import { useToast } from '@/components/toast/ToastProvider';

export default function ResourcePage() {
	const { resourceId } = useParams();
	const isNewResource = resourceId === 'new';
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();

	const { resource, loading, saveResource, removeResource } = useResource(
		resourceId,
		isNewResource
	);
	const [editing, setEditing] = useState(isNewResource);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [currentImageSrc, setCurrentImageSrc] = useState<string>(
		getImageForResourceType('Medical')
	);

	// Handle navigation for invalid IDs
	useEffect(() => {
		if (!isNewResource && resourceId && isNaN(Number(resourceId))) {
			navigate('/resources');
		}
	}, [resourceId, navigate, isNewResource]);

	// Update image when resource changes
	useEffect(() => {
		if (resource) {
			setCurrentImageSrc(resource.image);
		} else if (isNewResource) {
			setCurrentImageSrc(getImageForResourceType('Medical'));
		}
	}, [resource, isNewResource]);

	// Set editing to false when loading existing resource
	useEffect(() => {
		if (!isNewResource && resource) {
			setEditing(false);
		}
	}, [resource, isNewResource]);

	const handleSave = async (formData: ResourceFormData) => {
		try {
			const savedResource = await saveResource(formData);
			if (savedResource) {
				if (isNewResource) {
					showSuccess(`Resource "${savedResource.name}" has been created successfully!`);
					navigate(`/resources/${savedResource.resourceId}`);
				} else {
					showSuccess(`Resource "${savedResource.name}" has been updated successfully!`);
					setEditing(false);
				}
			} else {
				showError('Failed to save resource. Please try again.');
			}
		} catch (err) {
			showError('An unexpected error occurred while saving.');
			console.error(err);
		}
	};

	const handleDelete = () => {
		if (!resource) return;
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!resource) return;
		try {
			const success = await removeResource();
			if (success) {
				showSuccess(`Resource "${resource.name}" has been deleted successfully.`);
				navigate('/resources');
			} else {
				showError('Failed to delete resource. Please try again.');
			}
		} catch (err) {
			showError('An unexpected error occurred while deleting.');
			console.error(err);
		}
		setShowDeleteModal(false);
	};

	const handleCancel = () => {
		if (isNewResource) {
			navigate('/resources');
		} else {
			setEditing(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<div className="text-center">Loading...</div>
				</div>
			</div>
		);
	}

	if (!resource && !isNewResource) {
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
							alt={editing || isNewResource ? 'Resource preview' : resource?.name || 'Resource'}
							className="h-32 w-32 object-contain"
						/>
						<div className="flex-1">
							{!editing && resource ? (
								<ResourceView
									resource={resource}
									onEdit={() => setEditing(true)}
									onDelete={handleDelete}
									onBack={() => navigate('/resources')}
								/>
							) : (
								<ResourceForm
									{...(resource && { initialData: resource })}
									isNewResource={isNewResource}
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
