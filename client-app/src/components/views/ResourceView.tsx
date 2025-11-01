import Button from '@/components/ui/Button';
import type { Resource } from '@/types/resource';
import { RESOURCE_TYPES, getDisplayImageSrc } from '@/utils/resourceUtils';

interface ResourceViewProps {
	resource: Resource;
	onEdit: () => void;
	onDelete: () => void;
	onBack: () => void;
}

export default function ResourceView({ resource, onEdit, onDelete, onBack }: ResourceViewProps) {
	return (
		<div className="relative">
			<div className="flex items-start space-x-6 mb-4">
				{getDisplayImageSrc(resource.image) && (
					<img
						src={getDisplayImageSrc(resource.image)}
						alt={resource.name || 'Resource'}
						className="h-32 w-32 object-contain"
					/>
				)}
				<div className="flex-1">
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
				</div>
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
