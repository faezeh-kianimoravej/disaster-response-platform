import React, { useState, useEffect } from 'react';

interface AllocationSummaryProps {
	allocationQuantities: Record<string, number>;
	resourceTypesMap?: Record<string, string>; // resourceId -> type name
	onChange?: (updatedQuantities: Record<string, number>) => void;
	onSave?: (updatedQuantities: Record<string, number>) => void;
	editable?: boolean;
}

const AllocationSummary: React.FC<AllocationSummaryProps> = ({
	allocationQuantities,
	resourceTypesMap,
	onChange,
	onSave,
	editable = false,
}) => {
	const [localQuantities, setLocalQuantities] =
		useState<Record<string, number>>(allocationQuantities);
	const [hasChanges, setHasChanges] = useState(false);

	// Update local state when props change
	useEffect(() => {
		setLocalQuantities(allocationQuantities);
		setHasChanges(false);
	}, [allocationQuantities]);

	const entries = Object.entries(localQuantities).filter(([, qty]) => {
		// In editable mode, show all entries including those with 0 quantity (for editing)
		// In read-only mode, only show entries with quantity > 0
		return editable ? qty >= 0 : qty > 0;
	});

	const handleQuantityChange = (resourceId: string, newQuantity: number) => {
		// Preserve the entry even if quantity is 0, only remove if explicitly deleted
		const updatedQuantities = {
			...localQuantities,
			[resourceId]: Math.max(0, newQuantity),
		};

		setLocalQuantities(updatedQuantities);
		setHasChanges(true);
		onChange?.(updatedQuantities);
	};

	const handleDelete = (resourceId: string) => {
		const updatedQuantities = { ...localQuantities };
		delete updatedQuantities[resourceId];

		setLocalQuantities(updatedQuantities);
		setHasChanges(true);
		onChange?.(updatedQuantities);
	};

	const handleSave = () => {
		onSave?.(localQuantities);
		setHasChanges(false);
	};

	return (
		<div className="border border-gray-300 bg-gray-50 p-4 text-sm w-full mt-[1px]">
			<h2 className="text-left text-sm font-semibold text-gray-900 pb-2 border-b border-gray-300 mb-2">
				Allocation Summary
			</h2>
			{entries.length === 0 ? (
				<p className="text-gray-400">No resources allocated.</p>
			) : (
				<>
					<ul className="divide-y divide-gray-200">
						{entries.map(([resourceId, qty]) => (
							<li key={resourceId} className="flex items-center justify-between py-2 text-gray-800">
								<span className="flex-1 truncate pr-2">
									{resourceTypesMap?.[resourceId] ?? `Resource ${resourceId}`}
								</span>
								<div className="flex items-center space-x-1">
									{editable ? (
										<>
											<input
												type="number"
												min="0"
												value={qty || ''}
												onChange={e => {
													const value = e.target.value;
													// If empty string, keep as 0 but don't remove the entry
													// If valid number, use that value
													const numValue = value === '' ? 0 : parseInt(value, 10);
													handleQuantityChange(resourceId, isNaN(numValue) ? 0 : numValue);
												}}
												className="w-12 text-xs border border-gray-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
											/>
											<button
												onClick={() => handleDelete(resourceId)}
												className="text-red-500 hover:text-red-700 ml-1 p-0.5"
												title="Delete resource"
											>
												<svg
													className="w-3 h-3"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</>
									) : (
										<span className="font-medium">{qty}</span>
									)}
								</div>
							</li>
						))}
					</ul>
					{editable && hasChanges && (
						<div className="mt-3 pt-3 border-t border-gray-300">
							<button
								onClick={handleSave}
								className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
							>
								Save Changes
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default AllocationSummary;
