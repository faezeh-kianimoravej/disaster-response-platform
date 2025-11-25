import { describe, it, expect } from 'vitest';
import {
	assignedPersonnelSchema,
	allocatedResourceSchema,
	fillUnitAssignmentSchema,
	validateRequiredPersonnel,
	validateResourceRequirements,
	type FillUnitFormData,
} from '@/validation/fillUnitValidation';

describe('Fill Unit Validation', () => {
	describe('assignedPersonnelSchema', () => {
		const validPersonnel = {
			slotId: 1,
			userId: 100,
			specialization: 'paramedic',
		};

		it('accepts valid personnel assignment', () => {
			const result = assignedPersonnelSchema.safeParse(validPersonnel);
			expect(result.success).toBe(true);
		});

		it('rejects personnel with invalid userId', () => {
			const invalidPersonnel = { ...validPersonnel, userId: 0 };
			const result = assignedPersonnelSchema.safeParse(invalidPersonnel);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues.find(i => i.path.includes('userId'));
				expect(issue).toBeDefined();
				expect(issue!.message).toMatch(/User must be selected/i);
			}
		});

		it('rejects personnel with negative userId', () => {
			const invalidPersonnel = { ...validPersonnel, userId: -1 };
			const result = assignedPersonnelSchema.safeParse(invalidPersonnel);
			expect(result.success).toBe(false);
		});

		it('rejects personnel with empty specialization', () => {
			const invalidPersonnel = { ...validPersonnel, specialization: '' };
			const result = assignedPersonnelSchema.safeParse(invalidPersonnel);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues.find(i => i.path.includes('specialization'));
				expect(issue).toBeDefined();
				expect(issue!.message).toMatch(/Specialization is required/i);
			}
		});

		it('accepts personnel with specialization values', () => {
			const specializations = ['paramedic', 'emt_basic', 'driver', 'commander'];

			specializations.forEach(spec => {
				const personnel = { ...validPersonnel, specialization: spec };
				const result = assignedPersonnelSchema.safeParse(personnel);
				expect(result.success).toBe(true);
			});
		});
	});

	describe('allocatedResourceSchema', () => {
		const validResource = {
			resourceId: 10,
			quantity: 5,
			isPrimary: true,
		};

		it('accepts valid resource allocation', () => {
			const result = allocatedResourceSchema.safeParse(validResource);
			expect(result.success).toBe(true);
		});

		it('rejects resource with zero quantity', () => {
			const invalidResource = { ...validResource, quantity: 0 };
			const result = allocatedResourceSchema.safeParse(invalidResource);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues.find(i => i.path.includes('quantity'));
				expect(issue).toBeDefined();
				expect(issue!.message).toMatch(/Quantity must be at least 1/i);
			}
		});

		it('rejects resource with negative quantity', () => {
			const invalidResource = { ...validResource, quantity: -1 };
			const result = allocatedResourceSchema.safeParse(invalidResource);
			expect(result.success).toBe(false);
		});

		it('accepts resource with isPrimary false', () => {
			const resource = { ...validResource, isPrimary: false };
			const result = allocatedResourceSchema.safeParse(resource);
			expect(result.success).toBe(true);
		});

		it('accepts resource with large quantity', () => {
			const resource = { ...validResource, quantity: 999 };
			const result = allocatedResourceSchema.safeParse(resource);
			expect(result.success).toBe(true);
		});
	});

	describe('fillUnitAssignmentSchema', () => {
		const validFormData = {
			assignedUnitId: 100,
			assignedPersonnel: [
				{ slotId: 0, userId: 501, specialization: 'paramedic' },
				{ slotId: 1, userId: 502, specialization: 'driver' },
			],
			allocatedResources: [
				{ resourceId: 1, quantity: 2, isPrimary: true },
				{ resourceId: 2, quantity: 5, isPrimary: false },
			],
			notes: 'Test assignment with full personnel and resources',
		};

		it('accepts valid fill unit assignment', () => {
			const result = fillUnitAssignmentSchema.safeParse(validFormData);
			expect(result.success).toBe(true);
		});

		it('rejects assignment with invalid unitId', () => {
			const invalidData = { ...validFormData, assignedUnitId: 0 };
			const result = fillUnitAssignmentSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues.find(i => i.path.includes('assignedUnitId'));
				expect(issue).toBeDefined();
				expect(issue!.message).toMatch(/Response unit must be selected/i);
			}
		});

		it('accepts assignment without notes', () => {
			const dataWithoutNotes = { ...validFormData, notes: undefined };
			const result = fillUnitAssignmentSchema.safeParse(dataWithoutNotes);
			expect(result.success).toBe(true);
		});

		it('accepts assignment with empty personnel array', () => {
			const dataWithoutPersonnel = { ...validFormData, assignedPersonnel: [] };
			const result = fillUnitAssignmentSchema.safeParse(dataWithoutPersonnel);
			expect(result.success).toBe(true);
		});

		it('accepts assignment with empty resources array', () => {
			const dataWithoutResources = { ...validFormData, allocatedResources: [] };
			const result = fillUnitAssignmentSchema.safeParse(dataWithoutResources);
			expect(result.success).toBe(true);
		});

		it('rejects assignment with invalid personnel data', () => {
			const invalidData = {
				...validFormData,
				assignedPersonnel: [
					{ slotId: 0, userId: 0, specialization: 'paramedic' }, // Invalid userId
				],
			};
			const result = fillUnitAssignmentSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects assignment with invalid resource data', () => {
			const invalidData = {
				...validFormData,
				allocatedResources: [
					{ resourceId: 1, quantity: 0, isPrimary: true }, // Invalid quantity
				],
			};
			const result = fillUnitAssignmentSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe('validateRequiredPersonnel', () => {
		const mockFormData: FillUnitFormData = {
			assignedUnitId: 100,
			assignedPersonnel: [
				{ slotId: 0, userId: 501, specialization: 'paramedic' },
				{ slotId: 1, userId: 502, specialization: 'driver' },
			],
			allocatedResources: [],
			notes: '',
		};

		const mockRequiredSlots = [
			{ slotId: 0, specialization: 'paramedic', isRequired: true },
			{ slotId: 1, specialization: 'driver', isRequired: true },
			{ slotId: 2, specialization: 'emt_basic', isRequired: false },
		];

		it('returns no errors when all required personnel are assigned', () => {
			const errors = validateRequiredPersonnel(mockFormData, mockRequiredSlots);
			expect(errors).toHaveLength(0);
		});

		it('returns error for missing required personnel', () => {
			const incompleteFormData = {
				...mockFormData,
				assignedPersonnel: [
					{ slotId: 0, userId: 501, specialization: 'paramedic' },
					// Missing required driver slot (slotId: 1)
				],
			};

			const errors = validateRequiredPersonnel(incompleteFormData, mockRequiredSlots);
			expect(errors).toHaveLength(1);
			expect(errors[0]).toMatch(/driver personnel slot is required/i);
		});

		it('does not return error for missing optional personnel', () => {
			const formDataMissingOptional = {
				...mockFormData,
				assignedPersonnel: [
					{ slotId: 0, userId: 501, specialization: 'paramedic' },
					{ slotId: 1, userId: 502, specialization: 'driver' },
					// Missing optional emt_basic slot (slotId: 2) - this should be okay
				],
			};

			const errors = validateRequiredPersonnel(formDataMissingOptional, mockRequiredSlots);
			expect(errors).toHaveLength(0);
		});

		it('returns multiple errors for multiple missing required personnel', () => {
			const emptyFormData = {
				...mockFormData,
				assignedPersonnel: [],
			};

			const errors = validateRequiredPersonnel(emptyFormData, mockRequiredSlots);
			expect(errors).toHaveLength(2); // Both paramedic and driver are required
			expect(errors).toContain('paramedic personnel slot is required');
			expect(errors).toContain('driver personnel slot is required');
		});

		it('handles empty required slots array', () => {
			const errors = validateRequiredPersonnel(mockFormData, []);
			expect(errors).toHaveLength(0);
		});

		it('handles form data with no assigned personnel', () => {
			const emptyAssignments = {
				...mockFormData,
				assignedPersonnel: [],
			};

			const errors = validateRequiredPersonnel(emptyAssignments, mockRequiredSlots);
			expect(errors.length).toBeGreaterThan(0);
		});
	});

	describe('validateResourceRequirements', () => {
		const mockFormData: FillUnitFormData = {
			assignedUnitId: 100,
			assignedPersonnel: [],
			allocatedResources: [
				{ resourceId: 1, quantity: 5, isPrimary: true },
				{ resourceId: 2, quantity: 10, isPrimary: false },
			],
			notes: '',
		};

		const mockRequiredResources = [
			{ resourceId: 1, requiredQuantity: 3, resourceName: 'Fire Hose' },
			{ resourceId: 2, requiredQuantity: 8, resourceName: 'Medical Kit' },
		];

		it('returns no errors when all resource requirements are met', () => {
			const errors = validateResourceRequirements(mockFormData, mockRequiredResources);
			expect(errors).toHaveLength(0);
		});

		it('returns error for missing resource allocation', () => {
			const incompleteFormData = {
				...mockFormData,
				allocatedResources: [
					{ resourceId: 1, quantity: 5, isPrimary: true },
					// Missing resource 2
				],
			};

			const errors = validateResourceRequirements(incompleteFormData, mockRequiredResources);
			expect(errors).toHaveLength(1);
			expect(errors[0]).toMatch(/Medical Kit resource allocation is required/i);
		});

		it('returns error for insufficient resource quantity', () => {
			const insufficientFormData = {
				...mockFormData,
				allocatedResources: [
					{ resourceId: 1, quantity: 2, isPrimary: true }, // Required 3, allocated 2
					{ resourceId: 2, quantity: 10, isPrimary: false },
				],
			};

			const errors = validateResourceRequirements(insufficientFormData, mockRequiredResources);
			expect(errors).toHaveLength(1);
			expect(errors[0]).toMatch(/Fire Hose requires at least 3 units, but only 2 allocated/i);
		});

		it('returns multiple errors for multiple resource issues', () => {
			const problematicFormData = {
				...mockFormData,
				allocatedResources: [
					{ resourceId: 1, quantity: 1, isPrimary: true }, // Insufficient quantity
					// Missing resource 2 entirely
				],
			};

			const errors = validateResourceRequirements(problematicFormData, mockRequiredResources);
			expect(errors).toHaveLength(2);
			expect(errors[0]).toMatch(/Fire Hose requires at least 3 units, but only 1 allocated/i);
			expect(errors[1]).toMatch(/Medical Kit resource allocation is required/i);
		});

		it('handles empty required resources array', () => {
			const errors = validateResourceRequirements(mockFormData, []);
			expect(errors).toHaveLength(0);
		});

		it('handles form data with no allocated resources', () => {
			const noResourcesFormData = {
				...mockFormData,
				allocatedResources: [],
			};

			const errors = validateResourceRequirements(noResourcesFormData, mockRequiredResources);
			expect(errors).toHaveLength(2); // Both resources are missing
			expect(errors).toContain('Fire Hose resource allocation is required');
			expect(errors).toContain('Medical Kit resource allocation is required');
		});

		it('allows over-allocation of resources', () => {
			const overAllocatedFormData = {
				...mockFormData,
				allocatedResources: [
					{ resourceId: 1, quantity: 10, isPrimary: true }, // Required 3, allocated 10
					{ resourceId: 2, quantity: 15, isPrimary: false }, // Required 8, allocated 15
				],
			};

			const errors = validateResourceRequirements(overAllocatedFormData, mockRequiredResources);
			expect(errors).toHaveLength(0); // Over-allocation should be allowed
		});
	});

	describe('Integration tests', () => {
		it('validates complete fill unit assignment workflow', () => {
			// Test a realistic scenario with all validations
			const completeFormData: FillUnitFormData = {
				assignedUnitId: 200,
				assignedPersonnel: [
					{ slotId: 0, userId: 501, specialization: 'paramedic' },
					{ slotId: 1, userId: 502, specialization: 'driver' },
					{ slotId: 2, userId: 503, specialization: 'emt_basic' },
				],
				allocatedResources: [
					{ resourceId: 1, quantity: 5, isPrimary: true },
					{ resourceId: 2, quantity: 10, isPrimary: false },
					{ resourceId: 3, quantity: 2, isPrimary: false },
				],
				notes: 'Emergency response team fully equipped and ready for deployment',
			};

			// Schema validation
			const schemaResult = fillUnitAssignmentSchema.safeParse(completeFormData);
			expect(schemaResult.success).toBe(true);

			// Required personnel validation
			const requiredSlots = [
				{ slotId: 0, specialization: 'paramedic', isRequired: true },
				{ slotId: 1, specialization: 'driver', isRequired: true },
				{ slotId: 2, specialization: 'emt_basic', isRequired: false },
			];

			const personnelErrors = validateRequiredPersonnel(completeFormData, requiredSlots);
			expect(personnelErrors).toHaveLength(0);

			// Required resources validation
			const requiredResources = [
				{ resourceId: 1, requiredQuantity: 3, resourceName: 'Fire Hose' },
				{ resourceId: 2, requiredQuantity: 8, resourceName: 'Medical Kit' },
				{ resourceId: 3, requiredQuantity: 1, resourceName: 'Oxygen Tank' },
			];

			const resourceErrors = validateResourceRequirements(completeFormData, requiredResources);
			expect(resourceErrors).toHaveLength(0);

			// All validations should pass
			const allErrors = [...personnelErrors, ...resourceErrors];
			expect(allErrors).toHaveLength(0);
		});

		it('handles minimal valid assignment', () => {
			const minimalFormData: FillUnitFormData = {
				assignedUnitId: 100,
				assignedPersonnel: [],
				allocatedResources: [],
			};

			const schemaResult = fillUnitAssignmentSchema.safeParse(minimalFormData);
			expect(schemaResult.success).toBe(true);

			const personnelErrors = validateRequiredPersonnel(minimalFormData, []);
			const resourceErrors = validateResourceRequirements(minimalFormData, []);

			expect(personnelErrors).toHaveLength(0);
			expect(resourceErrors).toHaveLength(0);
		});
	});
});
