import { z } from 'zod';
import { RESOURCE_TYPES } from '@/utils/resourceUtils';

export const resourceRequestSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		description: z.string().optional().nullable(),
		quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
		available: z.coerce.number().int().min(0, 'Available must be at least 0'),
		resourceType: z.string().refine(val => Object.keys(RESOURCE_TYPES).includes(val), {
			message: 'Invalid resource type',
		}),
		departmentId: z.coerce.number().int().min(1, 'Department is required'),
		image: z.string().min(1, 'Image is required'),
		latitude: z
			.number({ invalid_type_error: 'Latitude must be a number' })
			.min(-90, 'Latitude must be >= -90')
			.max(90, 'Latitude must be <= 90')
			.optional(),
		longitude: z
			.number({ invalid_type_error: 'Longitude must be a number' })
			.min(-180, 'Longitude must be >= -180')
			.max(180, 'Longitude must be <= 180')
			.optional(),
	})
	.superRefine((val, ctx) => {
		if (val.available < 0 || val.available > val.quantity) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Available must be between 0 and quantity',
				path: ['available'],
			});
		}
	});

export type ResourceRequestValues = z.infer<typeof resourceRequestSchema>;

export type ResourceFormDataValidated = ResourceRequestValues;
