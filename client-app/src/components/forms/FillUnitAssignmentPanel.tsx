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
		Record<number, { quantity: number; isPrimary: boolean }>
	>({});

	// Fetch available response units for the target department
	const { data: allResponseUnits, isLoading: responseUnitsLoading } = useResponseUnits(
		deploymentRequest.targetDepartmentId,
		{ enabled: deploymentRequest.status !== 'assigned' }
	);

	// Utility function to normalize unit types for comparison
	const normalizeUnitType = (unitType: string): string => {
		// Convert both to lowercase and remove underscores/spaces for comparison
		// This handles: "FIRE_TRUCK" -> "fire truck" and "Fire truck" -> "fire truck"
		return unitType.toLowerCase().replace(/_/g, ' ');
	};

	// Filter units by requested type and available status
	const availableResponseUnits =
		allResponseUnits?.filter(unit => {
			const normalizedUnitType = normalizeUnitType(unit.unitType);
			const normalizedRequestedType = normalizeUnitType(deploymentRequest.requestedUnitType);

			return normalizedUnitType === normalizedRequestedType && unit.status === 'AVAILABLE';
		}) || [];

	// Fetch department users for personnel selection
	const { users: departmentUsers, loading: usersLoading } = useUsersByDepartment(
		deploymentRequest.targetDepartmentId,
		{ enabled: !!selectedUnit && deploymentRequest.status !== 'assigned' }
	);

	// Fetch department resources for allocation
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

	// Update form when unit selection changes
	useEffect(() => {
		if (selectedUnit) {
			setValue('assignedUnitId', selectedUnit.unitId);

			// Reset assignments when unit changes
			setPersonnelAssignments({});
			setResourceAllocations({});
			setValue('assignedPersonnel', []);
			setValue('allocatedResources', []);
		}
	}, [selectedUnit, setValue]);

	// Handle personnel slot assignment
	const handlePersonnelAssignment = (
		slotId: number,
		userId: number,
		specialization: ResponderSpecialization
	) => {
		const newAssignments = {
			...personnelAssignments,
			[slotId]: { userId, specialization },
		};
		setPersonnelAssignments(newAssignments);

		// Update form
		const assignedPersonnel = Object.entries(newAssignments).map(([slotIdStr, assignment]) => ({
			slotId: parseInt(slotIdStr),
			userId: assignment.userId,
			specialization: assignment.specialization,
		}));
		setValue('assignedPersonnel', assignedPersonnel);
	};

	// Handle resource allocation
	const handleResourceAllocation = (resourceId: number, quantity: number, isPrimary: boolean) => {
		const newAllocations = {
			...resourceAllocations,
			[resourceId]: { quantity, isPrimary },
		};
		setResourceAllocations(newAllocations);

		// Update form
		const allocatedResources = Object.entries(newAllocations)
			.filter(([, allocation]) => allocation.quantity > 0)
			.map(([resourceIdStr, allocation]) => ({
				resourceId: parseInt(resourceIdStr),
				quantity: allocation.quantity,
				isPrimary: allocation.isPrimary,
			}));
		setValue('allocatedResources', allocatedResources);
	};

	// Form submission
	const onSubmit = async (formData: FillUnitFormData) => {
		if (!auth?.user?.userId || !selectedUnit) {
			showError('Authentication error. Please log in again.');
			return;
		}

		// Additional custom validations
		const requiredSlots = selectedUnit.defaultPersonnel.map((slot, index) => ({
			slotId: index,
			specialization: slot.specialization,
			isRequired: slot.isRequired,
		}));

		const requiredResources = selectedUnit.defaultResources.map(resource => ({
			resourceId: resource.resourceId,
			requiredQuantity: resource.quantity,
			resourceName:
				departmentResources?.find(r => r.resourceId === resource.resourceId)?.name ||
				`Resource ${resource.resourceId}`,
		}));

		const personnelErrors = validateRequiredPersonnel(formData, requiredSlots);
		const resourceErrors = validateResourceRequirements(formData, requiredResources);

		if (personnelErrors.length > 0 || resourceErrors.length > 0) {
			const allErrors = [...personnelErrors, ...resourceErrors];
			showError(`Please fix the following issues: ${allErrors.join(', ')}`);
			return;
		}

		try {
			const assignmentData: FillUnitAssignmentRequest = {
				requestId: deploymentRequest.requestId,
				assignedBy: auth.user.userId,
				assignedUnitId: formData.assignedUnitId,
				assignedPersonnel: formData.assignedPersonnel.map(p => ({
					slotId: p.slotId,
					userId: p.userId,
					specialization: p.specialization as ResponderSpecialization,
				})),
				allocatedResources: formData.allocatedResources,
				...(formData.notes ? { notes: formData.notes } : {}),
			};

			await assignMutation.mutateAsync(assignmentData);

			showSuccess('Deployment created successfully');
			onAssignmentSuccess?.();

			// Navigate to deployment details page
			navigate(routes.deploymentRequestDetails(deploymentRequest.requestId));
		} catch {
			showError('Failed to create deployment. Please try again.');
		}
	};

	const isLoading = responseUnitsLoading || usersLoading || resourcesLoading;

	if (isLoading) {
		return <LoadingPanel text="Loading assignment options..." />;
	}

	return (
		<div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
			<h3 className="text-lg font-semibold text-gray-900 mb-6">Fill Unit Assignment</h3>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Response Unit Selection */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Select {deploymentRequest.requestedUnitType} Response Unit{' '}
						<span className="text-red-500">*</span>
					</label>

					{availableResponseUnits.length === 0 ? (
						<div className="text-gray-500 italic">
							No available {deploymentRequest.requestedUnitType} response units in this department.
						</div>
					) : (
						<div className="space-y-3">
							{availableResponseUnits.map(unit => (
								<label
									key={unit.unitId}
									className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
								>
									<input
										type="radio"
										name="responseUnit"
										checked={selectedUnit?.unitId === unit.unitId}
										onChange={() => setSelectedUnit(unit)}
										className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
									/>
									<div className="flex-1">
										<div className="font-medium text-gray-900">{unit.unitName}</div>
										<div className="text-sm text-gray-600">Type: {unit.unitType}</div>
										{unit.defaultResources && unit.defaultResources.length > 0 && (
											<div className="text-xs text-gray-500 mt-1">
												Resources: {unit.defaultResources.length} configured
											</div>
										)}
										{unit.defaultPersonnel && unit.defaultPersonnel.length > 0 && (
											<div className="text-xs text-gray-500 mt-1">
												Personnel: {unit.defaultPersonnel.length} slots
											</div>
										)}
									</div>
								</label>
							))}
						</div>
					)}
				</div>

				{/* Personnel Assignment Section */}
				{selectedUnit && (
					<div>
						<h4 className="text-md font-medium text-gray-900 mb-4">Personnel Assignment</h4>
						<div className="space-y-4">
							{selectedUnit.defaultPersonnel.map((slot, slotIndex) => (
								<div key={slotIndex} className="border border-gray-200 rounded-md p-4">
									<div className="flex items-center space-x-2 mb-2">
										<span className="text-sm font-medium text-gray-700">{slot.specialization}</span>
										{slot.isRequired && (
											<span className="text-xs text-red-500 font-medium">Required</span>
										)}
									</div>
									<select
										className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
										value={personnelAssignments[slotIndex]?.userId || ''}
										onChange={e => {
											const userId = parseInt(e.target.value);
											if (userId) {
												handlePersonnelAssignment(slotIndex, userId, slot.specialization);
											}
										}}
									>
										<option value="">Select personnel...</option>
										{departmentUsers
											?.filter(
												user => user.responderProfile?.primarySpecialization === slot.specialization
											)
											.map(user => (
												<option key={user.userId} value={user.userId}>
													{user.firstName} {user.lastName}
												</option>
											))}
									</select>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Resource Allocation Section */}
				{selectedUnit && (
					<div>
						<h4 className="text-md font-medium text-gray-900 mb-4">Resource Allocation</h4>
						<div className="space-y-4">
							{selectedUnit.defaultResources.map((resource, resourceIndex) => {
								const resourceDetails = departmentResources?.find(
									r => r.resourceId === resource.resourceId
								);

								// Skip resources that aren't available in this department
								if (!resourceDetails) {
									return null;
								}

								return (
									<div key={resourceIndex} className="border border-gray-200 rounded-md p-4">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium text-gray-700">
												{resourceDetails?.name || `Resource ${resource.resourceId}`}
											</span>
											<span className="text-xs text-gray-500">Required: {resource.quantity}</span>
										</div>
										<div className="flex items-center space-x-4">
											<div className="flex-1">
												<label className="block text-xs text-gray-500 mb-1">Quantity</label>
												<input
													type="number"
													min="1"
													max={resourceDetails?.availableQuantity || 999}
													className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
													placeholder={resource.quantity.toString()}
													value={
														resourceAllocations[resource.resourceId]?.quantity || resource.quantity
													}
													onChange={e => {
														const quantity = parseInt(e.target.value) || 0;
														handleResourceAllocation(
															resource.resourceId,
															quantity,
															resource.isPrimary
														);
													}}
												/>
											</div>
											<div className="text-xs text-gray-500">
												Available: {resourceDetails?.availableQuantity || 0}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Notes Section */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
					<textarea
						{...register('notes')}
						rows={3}
						className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Add any additional notes about this assignment..."
					/>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end">
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
	);
}
