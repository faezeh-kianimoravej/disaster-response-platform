import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useResource } from '@/hooks/useResource';
import ResourceForm from '@/components/ResourceForm';
import ResourceView from '@/components/ResourceView';
import { getImageForResourceType, type ResourceFormData } from '@/data/resources';

export default function ResourcePage() {
	const { resourceId } = useParams();
	const isNewResource = resourceId === 'new';
	const navigate = useNavigate();

	const { resource, loading, saveResource, removeResource } = useResource(
		resourceId,
		isNewResource
	);
	const [editing, setEditing] = useState(isNewResource);
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

	const handleSave = (formData: ResourceFormData) => {
		const savedResource = saveResource(formData);
		if (savedResource) {
			if (isNewResource) {
				navigate(`/resources/${savedResource.resourceId}`);
			} else {
				setEditing(false);
			}
		}
	};

	const handleDelete = () => {
		if (!resource) return;

		if (!confirm(`Delete resource "${resource.name}"? This cannot be undone.`)) return;

		const success = removeResource();
		if (success) navigate('/resources');
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
		</div>
	);
}
