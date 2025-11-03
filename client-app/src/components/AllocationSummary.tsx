import React from 'react';

interface AllocationSummaryProps {
	allocationQuantities: Record<string, number>;
	resourceTypesMap?: Record<string, string>; // resourceId -> type name
}

const AllocationSummary: React.FC<AllocationSummaryProps> = ({
	allocationQuantities,
	resourceTypesMap,
}) => {
	const entries = Object.entries(allocationQuantities).filter(([, qty]) => qty && qty > 0);

	return (
		<div className="border border-gray-300 bg-gray-50 p-4 text-sm w-full md:w-[250px] mt-[1px]">
			<h2 className="text-left text-sm font-semibold text-gray-900 pb-2 border-b border-gray-300 mb-2">
				Allocation Summary
			</h2>
			{entries.length === 0 ? (
				<p className="text-gray-400">No resources allocated.</p>
			) : (
				<ul className="divide-y divide-gray-200">
					{entries.map(([resourceId, qty]) => (
						<li key={resourceId} className="flex justify-between py-2 text-gray-800">
							<span>{resourceTypesMap?.[resourceId] ?? `Resource ${resourceId}`}</span>
							<span className="font-medium">{qty}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default AllocationSummary;
