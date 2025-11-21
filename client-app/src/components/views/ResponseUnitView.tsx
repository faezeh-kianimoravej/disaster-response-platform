import Button from '@/components/ui/Button';
import type { ResponseUnit } from '@/types/responseUnit';

interface ResponseUnitViewProps {
	responseUnit: ResponseUnit;
	onEdit: () => void;
	onDelete: () => void;
	onBack: () => void;
}

export default function ResponseUnitView({
	responseUnit,
	onEdit,
	onDelete,
	onBack,
}: ResponseUnitViewProps) {
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
						{responseUnit.currentDeploymentId && (
							<p>
								<strong>Current Deployment:</strong> {responseUnit.currentDeploymentId}
							</p>
						)}
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
					<p className="text-sm text-gray-600 mb-4">Resources assigned to this unit by default</p>
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
					<p className="text-sm text-gray-600 mb-4">Personnel assigned to this unit by default</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{responseUnit.defaultPersonnel.map((person, index) => (
							<div key={person.userId || index} className="p-3 bg-white border rounded-lg">
								{person.userId ? (
									<div className="font-medium">User ID: {person.userId}</div>
								) : (
									<div className="font-medium text-gray-500">Open Position</div>
								)}
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
				<div className="mb-6 bg-gray-50 rounded-lg p-4">
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
				<div className="mb-6 bg-gray-50 rounded-lg p-4">
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
