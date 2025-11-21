import { z } from 'zod';

export const responseUnitValidation = z.object({
	unitName: z
		.string()
		.min(1, 'Unit name is required')
		.max(100, 'Unit name cannot exceed 100 characters'),
	unitType: z.string().min(1, 'Unit type is required'),
	departmentId: z.number().int().positive('Department ID must be a positive number'),
	defaultResources: z
		.array(
			z.object({
				resourceId: z.number().int().positive(),
				quantity: z.number().int().positive().default(1),
				isPrimary: z.boolean().default(false),
			})
		)
		.default([]),
	defaultPersonnel: z
		.array(
			z.object({
				userId: z.number().int().positive().optional(),
				specialization: z.string().min(1, 'Specialization is required'),
				isRequired: z.boolean().default(true),
			})
		)
		.default([]),
});
