import React from 'react';

interface ResourceSearchResult {
	resourceId: string | number;
	resourceType: string;
	department: string;
	municipality: string;
	available: number;
	distance: string;
}

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
	const handleChange = (id: string, value: number) => {
		setAllocationQuantities({ ...allocationQuantities, [id]: value });
	};

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full border border-gray-200 bg-white rounded-lg text-sm">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-3 py-1.5 border-b border-gray-200 text-left font-medium">Type</th>
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
								{resource.resourceType}
							</td>
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
								<input
									type="number"
									min={0}
									max={resource.available}
									value={allocationQuantities[String(resource.resourceId)] || ''}
									onChange={e => handleChange(String(resource.resourceId), Number(e.target.value))}
									className="w-16 border border-gray-300 rounded px-1 py-0.5 text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
									style={{ height: '1.8rem' }}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ResourceTable;
