import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { useToast } from '@/components/toast/ToastProvider';
import { useAuth } from '@/context/AuthContext';
import { routes } from '@/routes';

import { useAssignFillUnit, type FillUnitAssignmentRequest } from '@/hooks/useDeployment';
import { useResponseUnits } from '@/hooks/useResponseUnit';
import { useUsersByDepartment } from '@/hooks/useUser';
import { useResources } from '@/hooks/useResource';

import type { ResponderSpecialization } from '@/types/responderSpecialization';
import type { DeploymentRequest } from '@/types/deployment';
import type { ResponseUnit } from '@/types/responseUnit';

import {
	fillUnitAssignmentSchema,
	type FillUnitFormData,
	validateRequiredPersonnel,
	validateResourceRequirements,
} from '@/validation/fillUnitValidation';
import { Resource } from '@/types/resource';

interface FillUnitAssignmentPanelProps {
	deploymentRequest: DeploymentRequest;
	onAssignmentSuccess?: () => void;
}

export default function FillUnitAssignmentPanel({
	deploymentRequest,
	onAssignmentSuccess,
}: FillUnitAssignmentPanelProps) {
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();
	const auth = useAuth();
	const assignMutation = useAssignFillUnit();

	const [selectedUnit, setSelectedUnit] = useState<ResponseUnit | null>(null);
	const [personnelAssignments, setPersonnelAssignments] = useState<
		Record<number, { userId: number; specialization: ResponderSpecialization }>
	>({});
	const [resourceAllocations, setResourceAllocations] = useState<
		Record<number, { resourceId: number; quantity: number; isPrimary: boolean }>
	>({});

	// Fetch response units
	const { data: allResponseUnits, isLoading: responseUnitsLoading } = useResponseUnits(
		deploymentRequest.targetDepartmentId,
		{ enabled: deploymentRequest.status !== 'assigned' }
	);

	// Normalize string types
	const normalizeUnitType = (text: string) => text.toLowerCase().replace(/_/g, ' ');

	// Filter units based on requested type + AVAILABLE
	const availableResponseUnits =
		allResponseUnits?.filter(unit => {
			return (
				normalizeUnitType(unit.unitType) ===
					normalizeUnitType(deploymentRequest.requestedUnitType) && unit.status === 'AVAILABLE'
			);
		}) ?? [];

	// Fetch department users
	const { users: departmentUsers, loading: usersLoading } = useUsersByDepartment(
		deploymentRequest.targetDepartmentId,
		{ enabled: !!selectedUnit && deploymentRequest.status !== 'assigned' }
	);

	// Fetch department resources
	const { resources: departmentResources, loading: resourcesLoading } = useResources(
		deploymentRequest.targetDepartmentId,
		{ enabled: !!selectedUnit && deploymentRequest.status !== 'assigned' }
	);

	// Form setup
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isValid },
	} = useForm<FillUnitFormData>({
		resolver: zodResolver(fillUnitAssignmentSchema),
		defaultValues: {
			assignedUnitId: 0,
			assignedPersonnel: [],
			allocatedResources: [],
			notes: '',
		},
	});

	// Prefill Personnel + Resources when unit changes
	useEffect(() => {
		if (!selectedUnit || !departmentUsers || !departmentResources) return;

		setValue('assignedUnitId', selectedUnit.unitId);

		// —————————————————————————————
		//  PREFILL PERSONNEL
		// —————————————————————————————
		const personnel: Record<number, { userId: number; specialization: ResponderSpecialization }> =
			{};

		selectedUnit.defaultPersonnel.forEach((slot, index) => {
			if (!slot.userId) return;

			const match = departmentUsers.find(
				u =>
					u.userId === slot.userId &&
					u.responderProfile?.primarySpecialization === slot.specialization
			);

			if (match) {
				personnel[index] = {
					userId: slot.userId,
					specialization: slot.specialization,
				};
			}
		});

		setPersonnelAssignments(personnel);

		setValue(
			'assignedPersonnel',
			Object.entries(personnel).map(([slotId, a]) => ({
				slotId: parseInt(slotId),
				userId: a.userId,
				specialization: a.specialization,
			}))
		);

		// —————————————————————————————
		//  PREFILL RESOURCES
		// —————————————————————————————
		const resources: Record<number, { resourceId: number; quantity: number; isPrimary: boolean }> =
			{};

		selectedUnit.defaultResources.forEach((res, idx) => {
			resources[idx] = {
				resourceId: res.resourceId,
				quantity: res.quantity,
				isPrimary: res.isPrimary,
			};
		});

		setResourceAllocations(resources);

		setValue(
			'allocatedResources',
			Object.values(resources).map(r => ({
				resourceId: r.resourceId,
				quantity: r.quantity,
				isPrimary: r.isPrimary,
			}))
		);
	}, [selectedUnit, departmentUsers, departmentResources, setValue]);

	// Update personnel assignment
	const handlePersonnelAssignment = (
		slotId: number,
		userId: number,
		specialization: ResponderSpecialization
	) => {
		const assignments = { ...personnelAssignments };

		if (userId === 0) delete assignments[slotId];
		else assignments[slotId] = { userId, specialization };

		setPersonnelAssignments(assignments);

		setValue(
			'assignedPersonnel',
			Object.entries(assignments).map(([slotId, a]) => ({
				slotId: parseInt(slotId),
				userId: a.userId,
				specialization: a.specialization,
			}))
		);
	};

	// ———————————————————————————————————
	//  RESOURCE ALLOCATION LOGIC (FIXED)
	// ———————————————————————————————————

	// Determines if resource is available
	const isResourceAvailable = (r: Resource) => {
		if (r.resourceKind === 'UNIQUE') return r.status === 'AVAILABLE';
		return (r.availableQuantity ?? 0) > 0;
	};

	// Called when user changes dropdown or quantity
	const handleResourceAllocation = (
		index: number,
		resourceId: number,
		quantity: number,
		isPrimary: boolean
	) => {
		const resource = departmentResources?.find(r => r.resourceId === resourceId);
		const finalQty = resource?.resourceKind === 'UNIQUE' ? 1 : quantity;

		const allocations = { ...resourceAllocations };

		if (finalQty <= 0) delete allocations[index];
		else
			allocations[index] = {
				resourceId,
				quantity: finalQty,
				isPrimary,
			};

		setResourceAllocations(allocations);

		setValue(
			'allocatedResources',
			Object.values(allocations).map(a => ({
				resourceId: a.resourceId,
				quantity: a.quantity,
				isPrimary: a.isPrimary,
			}))
		);
	};

	// ———————————————————————————————————
	//  SUBMIT HANDLER
	// ———————————————————————————————————

	const onSubmit = async (data: FillUnitFormData) => {
		if (!auth?.user?.userId || !selectedUnit) {
			showError('Authentication error.');
			return;
		}

		// Validation
		const requiredSlots = selectedUnit.defaultPersonnel.map((slot, idx) => ({
			slotId: idx,
			specialization: slot.specialization,
			isRequired: slot.isRequired,
		}));

		const requiredResources = selectedUnit.defaultResources.map(r => ({
			resourceId: r.resourceId,
			requiredQuantity: r.quantity,
			resourceName:
				departmentResources?.find(dr => dr.resourceId === r.resourceId)?.name ||
				`Resource ${r.resourceId}`,
		}));

		const pErrors = validateRequiredPersonnel(data, requiredSlots);
		const rErrors = validateResourceRequirements(data, requiredResources);

		if (pErrors.length || rErrors.length) {
			showError([...pErrors, ...rErrors].join(', '));
			return;
		}

		try {
			const payload: FillUnitAssignmentRequest = {
				requestId: deploymentRequest.requestId,
				assignedBy: auth.user.userId,
				assignedUnitId: data.assignedUnitId,
				assignedPersonnel: data.assignedPersonnel.map(p => ({
					slotId: p.slotId,
					userId: p.userId,
					specialization: p.specialization as ResponderSpecialization,
				})),
				allocatedResources: data.allocatedResources,
				...(data.notes ? { notes: data.notes } : {}),
			};

			await assignMutation.mutateAsync(payload);

			showSuccess('Deployment created successfully');
			onAssignmentSuccess?.();
			navigate(routes.deploymentRequestDetails(deploymentRequest.requestId));
		} catch {
			showError('Failed to create deployment.');
		}
	};

	const isLoading = responseUnitsLoading || usersLoading || resourcesLoading;

	if (isLoading) return <LoadingPanel text="Loading assignment options..." />;

	// ———————————————————————————————————
	//  RENDER
	// ———————————————————————————————————

	return (
		<div className="mb-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Fill Unit Assignment</h3>
			<div className="bg-gray-50 rounded-lg p-4">
				<p className="text-sm text-gray-600 mb-6">
					Assign personnel and resources to {deploymentRequest.requestedUnitType} for deployment.
				</p>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Response Unit Selection */}
					<div className="space-y-3">
						<label className="block text-sm font-medium text-gray-700">
							Select {deploymentRequest.requestedUnitType} Response Unit
							<span className="text-red-500 ml-1">*</span>
						</label>

						{availableResponseUnits.length === 0 && (
							<div className="text-gray-500 text-sm">
								No available {deploymentRequest.requestedUnitType} units.
							</div>
						)}

						{availableResponseUnits.length > 0 && (
							<div className="space-y-2">
								{availableResponseUnits.map(unit => (
									<label
										key={unit.unitId}
										className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
									>
										<input
											type="radio"
											name="unit"
											checked={selectedUnit?.unitId === unit.unitId}
											onChange={() => setSelectedUnit(unit)}
											className="mt-1"
										/>
										<div>
											<div className="text-sm font-medium text-gray-900">{unit.unitName}</div>
											<div className="text-sm text-gray-500">Type: {unit.unitType}</div>
										</div>
									</label>
								))}
							</div>
						)}
					</div>

					{/* Personnel Assignment */}
					{selectedUnit && (
						<div className="space-y-4">
							<h4 className="text-lg font-medium text-gray-900">Personnel Assignment</h4>

							<div className="space-y-3">
								{selectedUnit.defaultPersonnel.map((slot, idx) => {
									const isDefault =
										slot.userId && personnelAssignments[idx]?.userId === slot.userId;

									return (
										<div key={idx} className="p-4 bg-gray-50 rounded-md border border-gray-200">
											<div className="flex items-center space-x-2 mb-2">
												<span className="text-sm font-medium text-gray-700">
													{slot.specialization}
												</span>
												{slot.isRequired && (
													<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
														Required
													</span>
												)}
												{isDefault && (
													<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
														Default
													</span>
												)}
											</div>

											<select
												className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
												value={personnelAssignments[idx]?.userId ?? ''}
												onChange={e => {
													const userId = parseInt(e.target.value);
													handlePersonnelAssignment(idx, userId || 0, slot.specialization);
												}}
											>
												<option value="">Select personnel...</option>

												{departmentUsers
													?.filter(
														u => u.responderProfile?.primarySpecialization === slot.specialization
													)
													.map(u => (
														<option key={u.userId} value={u.userId}>
															{u.firstName} {u.lastName}
														</option>
													))}
											</select>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Resource Allocation */}
					{selectedUnit && (
						<div className="space-y-4">
							<h4 className="text-lg font-medium text-gray-900">Resource Allocation</h4>

							<div className="space-y-3">
								{selectedUnit.defaultResources.map((res, idx) => {
									const defaultRes = departmentResources?.find(
										r => r.resourceId === res.resourceId
									);

									if (!defaultRes) return null;

									const matchingResources =
										departmentResources?.filter(r => {
											return r.resourceType === defaultRes.resourceType && isResourceAvailable(r);
										}) ?? [];

									const current = resourceAllocations[idx];
									const selectedId = current?.resourceId ?? res.resourceId;
									const selectedDetails = departmentResources?.find(
										r => r.resourceId === selectedId
									);

									const availabilityText =
										selectedDetails?.resourceKind === 'UNIQUE'
											? `Status: ${selectedDetails.status}`
											: `Available: ${selectedDetails?.availableQuantity ?? 0}`;

									return (
										<div key={idx} className="p-4 bg-gray-50 rounded-md border border-gray-200">
											<div className="flex justify-between items-center mb-3">
												<div>
													<div className="text-sm font-medium text-gray-700">
														{defaultRes.resourceType.replace(/_/g, ' ')}
													</div>
													<div className="text-xs text-gray-500">Required: {res.quantity}</div>
												</div>
											</div>

											{/* Resource Dropdown */}
											<div className="space-y-3">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Select Resource
													</label>
													<select
														className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
														value={selectedId}
														onChange={e => {
															const newId = parseInt(e.target.value);
															handleResourceAllocation(
																idx,
																newId,
																current?.quantity ?? res.quantity,
																res.isPrimary
															);
														}}
													>
														{matchingResources.map(r => {
															return (
																<option key={r.resourceId} value={r.resourceId}>
																	{r.name} (
																	{r.resourceKind === 'UNIQUE'
																		? r.status
																		: `Available: ${r.availableQuantity}`}
																	)
																</option>
															);
														})}
													</select>
												</div>

												{/* Quantity Input */}
												<div className="grid grid-cols-2 gap-4">
													<div>
														<label className="block text-sm font-medium text-gray-700 mb-1">
															Quantity
														</label>
														<input
															type="number"
															min={1}
															max={
																selectedDetails?.resourceKind === 'UNIQUE'
																	? 1
																	: (selectedDetails?.availableQuantity ?? 999)
															}
															disabled={selectedDetails?.resourceKind === 'UNIQUE'}
															className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
															value={
																selectedDetails?.resourceKind === 'UNIQUE'
																	? 1
																	: (current?.quantity ?? res.quantity)
															}
															onChange={e => {
																const qty = parseInt(e.target.value) || 0;
																handleResourceAllocation(idx, selectedId, qty, res.isPrimary);
															}}
														/>
													</div>

													<div className="flex items-end">
														<div className="text-sm text-gray-500 pb-2">{availabilityText}</div>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* Notes Section */}
					<div className="space-y-1">
						<label className="block text-sm font-medium text-gray-700">
							Notes
							<span className="text-gray-500 ml-1">(Optional)</span>
						</label>
						<textarea
							{...register('notes')}
							rows={3}
							className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
							placeholder="Add any additional notes about this assignment..."
						/>
					</div>

					{/* Submit Button */}
					<div className="pt-4 border-t border-gray-200">
						<Button
							type="submit"
							disabled={!isValid || !selectedUnit || assignMutation.isPending}
							className="w-full"
						>
							{assignMutation.isPending ? 'Creating Deployment...' : 'Create Deployment'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
