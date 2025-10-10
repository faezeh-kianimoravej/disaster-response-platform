import { useState, useEffect } from 'react';
import { getResourceById, updateResource, deleteResource, addResource } from './api';
import type { Resource, ResourceFormData } from './types';

export function useResource(resourceId: string | undefined, isNewResource: boolean) {
	const [resource, setResource] = useState<Resource | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isNewResource) {
			setLoading(false);
			return;
		}

		const id = resourceId ? Number(resourceId) : NaN;
		if (isNaN(id)) {
			setLoading(false);
			return;
		}

		const fetchResource = async () => {
			try {
				const r = await getResourceById(id);
				setResource(r || null);
			} catch (err) {
				console.error('Failed to fetch resource:', err);
				setResource(null);
			} finally {
				setLoading(false);
			}
		};

		fetchResource();
	}, [resourceId, isNewResource]);

	const saveResource = async (formData: ResourceFormData): Promise<Resource | null> => {
		if (isNewResource) {
			const newResource = await addResource({
				departmentId: formData.departmentId,
				resourceType: formData.resourceType,
				image: formData.image,
				name: formData.name,
				description: formData.description,
				quantity: formData.quantity,
				available: formData.available,
			});
			setResource(newResource);
			return newResource;
		} else if (resource) {
			const updated: Resource = {
				resourceId: resource.resourceId,
				departmentId: formData.departmentId,
				resourceType: formData.resourceType,
				image: formData.image,
				name: formData.name,
				description: formData.description,
				quantity: formData.quantity,
				available: formData.available,
			};

			const updatedRes = await updateResource(updated);
			setResource(updatedRes);
			return updatedRes;
		}
		return null;
	};

	const removeResource = async (): Promise<boolean> => {
		if (!resource) return false;
		try {
			await deleteResource(resource.resourceId);
			setResource(null);
			return true;
		} catch (err) {
			console.error('Failed to delete resource:', err);
			return false;
		}
	};

	return {
		resource,
		loading,
		saveResource,
		removeResource,
	};
}
