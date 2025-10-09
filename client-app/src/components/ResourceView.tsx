import Button from './Button';
import type { Resource } from '@/data/resources';

interface ResourceViewProps {
	resource: Resource;
	onEdit: () => void;
	onDelete: () => void;
	onBack: () => void;
}

export default function ResourceView({ resource, onEdit, onDelete, onBack }: ResourceViewProps) {
	return (
		<div className="relative">
			{/* Navigation Button - Absolute Top Right */}
			<div className="absolute top-0 right-0">
				<Button onClick={onBack} variant="outline">
					← Back to Resources
				</Button>
			</div>

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
					<strong>Type:</strong> {resource.resourceType}
				</p>
			</div>

			{/* Action Buttons - Bottom */}
			<div className="mt-6 flex space-x-3">
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
