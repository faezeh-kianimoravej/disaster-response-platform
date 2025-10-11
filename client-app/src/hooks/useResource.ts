import { useState, useEffect } from 'react';
import { getResourceById, updateResource, deleteResource, addResource } from '@/api/resource';
import type { Resource, ResourceFormData } from '@/types/resource';

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
				...resource,
				...formData,
			};
			const saved = await updateResource(updated);
			setResource(saved);
			return saved;
		}
		return null;
	};

	const removeResource = async (): Promise<void> => {
		if (resource) {
			await deleteResource(resource.resourceId);
			setResource(null);
		}
	};

	return { resource, loading, saveResource, removeResource };
}
