// re-export ResourceView from its current location
import Button from '@/components/Button';
import type { Resource } from '@/types/resource';
import { RESOURCE_TYPES } from '@/utils/resourceUtils';

interface ResourceViewProps {
	resource: Resource;
	onEdit: () => void;
	onDelete: () => void;
	onBack: () => void;
}

export default function ResourceView({ resource, onEdit, onDelete, onBack }: ResourceViewProps) {
	return (
		<div className="relative">
			<h2 className="text-2xl font-semibold pr-40">{resource.name}</h2>
			<p className="text-gray-600 mt-2">{resource.description}</p>
			<div className="mt-4 text-gray-700">
				<p>
					<strong>Quantity:</strong> {resource.quantity}
				</p>
				<p>
					<strong>Available:</strong> {resource.available}
				</p>
				<p>
					<strong>Type:</strong>{' '}
					{RESOURCE_TYPES[resource.resourceType as keyof typeof RESOURCE_TYPES]}
				</p>
			</div>

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
