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
		<div>
			<h2 className="text-2xl font-semibold mb-6">{responseUnit.unitName}</h2>

			{/* Basic Information */}
			<div className="space-y-3 mb-6">
				<div className="grid grid-cols-2 gap-6">
					<div>
						<p className="text-sm font-medium text-gray-500">Unit Type</p>
						<p className="text-gray-900">{responseUnit.unitType}</p>
					</div>
					<div>
						<p className="text-sm font-medium text-gray-500">Status</p>
						<p className="text-gray-900">{responseUnit.status}</p>
					</div>
				</div>

				{responseUnit.currentDeploymentId && (
					<div>
						<p className="text-sm font-medium text-gray-500">Current Deployment</p>
						<p className="text-gray-900">{responseUnit.currentDeploymentId}</p>
					</div>
				)}

				{responseUnit.latitude && responseUnit.longitude && (
					<div className="grid grid-cols-2 gap-6">
						<div>
							<p className="text-sm font-medium text-gray-500">Latitude</p>
							<p className="text-gray-900">{responseUnit.latitude}</p>
						</div>
						<div>
							<p className="text-sm font-medium text-gray-500">Longitude</p>
							<p className="text-gray-900">{responseUnit.longitude}</p>
						</div>
					</div>
				)}
			</div>

			{/* Default Resources */}
			{responseUnit.defaultResources && responseUnit.defaultResources.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Default Resources</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.defaultResources.map(resource => (
							<div
								key={resource.resourceId}
								className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
							>
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Resource ID: {resource.resourceId}
								</h4>
								<div className="space-y-1 text-sm text-gray-600">
									<p>
										<strong>Quantity:</strong> {resource.quantity}
									</p>
									{resource.isPrimary && (
										<p className="text-blue-600 font-medium">Primary Resource</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Default Personnel */}
			{responseUnit.defaultPersonnel && responseUnit.defaultPersonnel.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Default Personnel</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.defaultPersonnel.map((person, index) => (
							<div
								key={person.userId || index}
								className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
							>
								{person.userId ? (
									<h4 className="text-sm font-medium text-gray-900 mb-2">
										User ID: {person.userId}
									</h4>
								) : (
									<h4 className="text-sm font-medium text-gray-500 mb-2">Open Position</h4>
								)}
								<div className="space-y-1 text-sm text-gray-600">
									<p>
										<strong>Specialization:</strong> {person.specialization}
									</p>
									{person.isRequired && <p className="text-red-600 font-medium">Required</p>}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Current Resources (if different from defaults) */}
			{responseUnit.currentResources && responseUnit.currentResources.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Current Resources</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.currentResources.map(resource => (
							<div
								key={resource.resourceId}
								className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
							>
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Resource ID: {resource.resourceId}
								</h4>
								<div className="space-y-1 text-sm text-gray-600">
									<p>
										<strong>Quantity:</strong> {resource.quantity}
									</p>
									{resource.isPrimary && (
										<p className="text-blue-600 font-medium">Primary Resource</p>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Current Personnel (if different from defaults) */}
			{responseUnit.currentPersonnel && responseUnit.currentPersonnel.length > 0 && (
				<div className="mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Current Personnel</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{responseUnit.currentPersonnel.map(person => (
							<div
								key={person.userId}
								className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
							>
								<h4 className="text-sm font-medium text-gray-900 mb-2">User ID: {person.userId}</h4>
								<div className="space-y-1 text-sm text-gray-600">
									<p>
										<strong>Specialization:</strong> {person.specialization}
									</p>
								</div>
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
