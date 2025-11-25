import { z } from 'zod';

// Personnel slot validation
export const assignedPersonnelSchema = z.object({
	slotId: z.number(),
	userId: z.number().min(1, 'User must be selected'),
	specialization: z.string().min(1, 'Specialization is required'),
});

// Resource allocation validation
export const allocatedResourceSchema = z.object({
	resourceId: z.number(),
	quantity: z.number().min(1, 'Quantity must be at least 1'),
	isPrimary: z.boolean(),
});

// Complete fill unit assignment validation
export const fillUnitAssignmentSchema = z.object({
	assignedUnitId: z.number().min(1, 'Response unit must be selected'),
	assignedPersonnel: z.array(assignedPersonnelSchema),
	allocatedResources: z.array(allocatedResourceSchema),
	notes: z.string().optional(),
});

// Form data type for the UI
export type FillUnitFormData = z.infer<typeof fillUnitAssignmentSchema>;

// Individual slot/resource types for easier handling
export type PersonnelSlotFormData = z.infer<typeof assignedPersonnelSchema>;
export type ResourceAllocationFormData = z.infer<typeof allocatedResourceSchema>;

// Custom validation function for required personnel slots
export function validateRequiredPersonnel(
	formData: FillUnitFormData,
	requiredSlots: Array<{ slotId: number; specialization: string; isRequired: boolean }>
): string[] {
	const errors: string[] = [];

	const assignedSlotIds = formData.assignedPersonnel.map(p => p.slotId);

	requiredSlots.forEach(slot => {
		if (slot.isRequired && !assignedSlotIds.includes(slot.slotId)) {
			errors.push(`${slot.specialization} personnel slot is required`);
		}
	});

	return errors;
}

// Custom validation function for resource requirements
export function validateResourceRequirements(
	formData: FillUnitFormData,
	requiredResources: Array<{ resourceId: number; requiredQuantity: number; resourceName: string }>
): string[] {
	const errors: string[] = [];

	requiredResources.forEach(required => {
		const allocated = formData.allocatedResources.find(r => r.resourceId === required.resourceId);

		if (!allocated) {
			errors.push(`${required.resourceName} resource allocation is required`);
		} else if (allocated.quantity < required.requiredQuantity) {
			errors.push(
				`${required.resourceName} requires at least ${required.requiredQuantity} units, but only ${allocated.quantity} allocated`
			);
		}
	});

	return errors;
}
