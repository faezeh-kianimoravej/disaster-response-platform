import { useState, useEffect } from 'react';
import { getResourceById, updateResource, deleteResource, addResource } from '@/data/resources';
import type { Resource, ResourceFormData } from '@/data/resources';

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

		const r = getResourceById(id);
		setResource(r || null);
		setLoading(false);
	}, [resourceId, isNewResource]);

	const saveResource = (formData: ResourceFormData): Resource | null => {
		if (isNewResource) {
			const newResource = addResource({
				departmentId: formData.departmentId,
				resourceType: formData.resourceType,
				image: formData.image,
				name: formData.name,
				description: formData.description,
				quantity: formData.quantity,
				available: formData.available,
			});
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

			const success = updateResource(updated);
			if (success) {
				setResource(updated);
				return updated;
			}
		}
		return null;
	};

	const removeResource = (): boolean => {
		if (!resource) return false;
		return deleteResource(resource.resourceId);
	};

	return {
		resource,
		loading,
		saveResource,
		removeResource,
	};
}
