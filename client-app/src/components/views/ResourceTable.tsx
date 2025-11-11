import React, { useState } from 'react';
import FormInput from '@/components/forms/base/FormInput';
import { getReadableResourceType } from '@/utils/resourceUtils';
import { ResourceSearchResult } from '@/types/resource';

interface ResourceTableProps {
	results: ResourceSearchResult[];
	allocationQuantities: Record<string, number>;
	setAllocationQuantities: (q: Record<string, number>) => void;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
	results,
	allocationQuantities,
	setAllocationQuantities,
}) => {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleChange = (id: string, value: number, max: number) => {
		// Validation
		let error = '';
		if (isNaN(value) || value < 0) {
			error = 'Must be a positive number';
		} else if (value > max) {
			error = `Cannot exceed available (${max})`;
		} else if (!Number.isInteger(value)) {
			error = 'Must be a whole number';
		}

		// Update errors
		setErrors(prev => ({
			...prev,
			[id]: error,
		}));

		// Only update quantity if it's valid
		if (!error) {
			const safeValue = Math.max(0, Math.min(Math.floor(value), max));
			setAllocationQuantities({ ...allocationQuantities, [id]: safeValue });
		}
	};

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full border border-gray-200 bg-white rounded-lg text-sm">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-3 py-1.5 border-b border-gray-200 text-left font-medium">Type</th>
						<th className="px-3 py-1.5 border-b border-gray-200 text-left font-medium">Name</th>
						<th className="px-3 py-1.5 border-b border-gray-200 text-left font-medium">
							Department
						</th>
						<th className="px-3 py-1.5 border-b border-gray-200 text-left font-medium">
							Municipality
						</th>
						<th className="px-3 py-1.5 border-b border-gray-200 text-right font-medium">
							Available
						</th>
						<th className="px-3 py-1.5 border-b border-gray-200 text-right font-medium">
							Distance
						</th>
						<th className="px-3 py-1.5 border-b border-gray-200 text-right font-medium">
							Allocate
						</th>
					</tr>
				</thead>
				<tbody>
					{results.map((resource: ResourceSearchResult, idx: number) => (
						<tr key={resource.resourceId} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
							<td className="px-3 py-1 border-b border-gray-100 align-middle">
								{getReadableResourceType(resource.resourceType)}
							</td>
							<td className="px-3 py-1 border-b border-gray-100 align-middle">{resource.name}</td>
							<td className="px-3 py-1 border-b border-gray-100 align-middle">
								{resource.department}
							</td>
							<td className="px-3 py-1 border-b border-gray-100 align-middle">
								{resource.municipality}
							</td>
							<td className="px-3 py-1 border-b border-gray-100 align-middle text-right">
								{resource.available}
							</td>
							<td className="px-3 py-1 border-b border-gray-100 align-middle text-right">
								{resource.distance}
							</td>
							<td className="px-3 py-1 border-b border-gray-100 align-middle text-right">
								<div className="flex flex-col items-end">
									<FormInput
										label=""
										name={`resource-${resource.resourceId}`}
										type="number"
										value={allocationQuantities[String(resource.resourceId)] || ''}
										onChange={e =>
											handleChange(
												String(resource.resourceId),
												Number(e.target.value),
												resource.available
											)
										}
										min={0}
										max={resource.available}
										placeholder="0"
										error={errors[String(resource.resourceId)]}
										showValidation={!!errors[String(resource.resourceId)]}
										className="w-16 text-sm"
									/>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ResourceTable;
