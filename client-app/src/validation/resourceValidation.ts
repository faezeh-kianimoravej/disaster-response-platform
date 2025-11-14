import { z } from 'zod';
import { RESOURCE_TYPES, RESOURCE_CATEGORIES } from '@/types/resource';

export const resourceRequestSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		resourceType: z.enum([...RESOURCE_TYPES]),
		category: z.enum([...RESOURCE_CATEGORIES]),
		resourceKind: z.enum(['UNIQUE', 'STACKABLE', 'CONSUMABLE']),
		totalQuantity: z.coerce
			.number()
			.int()
			.min(1, 'Total quantity must be at least 1')
			.nullable()
			.optional(),
		description: z.string().nullable().optional(),
		departmentId: z.coerce.number().int().min(1, 'Department is required').optional(),
		availableQuantity: z.coerce
			.number()
			.int()
			.min(0, 'Available quantity must be at least 0')
			.nullable()
			.optional(),
		unit: z.enum(['PIECES', 'LITERS', 'SETS', 'UNITS']).nullable().optional(),
		isTrackable: z.boolean().optional(),
		image: z.string().min(1, 'Image is required').optional(),
		latitude: z
			.number({ invalid_type_error: 'Latitude must be a number' })
			.min(-90, 'Latitude must be >= -90')
			.max(90, 'Latitude must be <= 90')
			.nullable()
			.optional(),
		longitude: z
			.number({ invalid_type_error: 'Longitude must be a number' })
			.min(-180, 'Longitude must be >= -180')
			.max(180, 'Longitude must be <= 180')
			.nullable()
			.optional(),
	})
	.superRefine((val, ctx) => {
		// If resourceKind is UNIQUE, totalQuantity, availableQuantity, and unit must be null/empty
		if (val.resourceKind === 'UNIQUE') {
			if (val.totalQuantity !== null && val.totalQuantity !== undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Total quantity must be empty for UNIQUE resources',
					path: ['totalQuantity'],
				});
			}
			if (val.availableQuantity !== null && val.availableQuantity !== undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Available quantity must be empty for UNIQUE resources',
					path: ['availableQuantity'],
				});
			}
			if (val.unit) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Unit must be empty for UNIQUE resources',
					path: ['unit'],
				});
			}
		} else {
			// For STACKABLE/CONSUMABLE, these fields are required
			if (val.totalQuantity === null || val.totalQuantity === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Total quantity is required for non-UNIQUE resources',
					path: ['totalQuantity'],
				});
			}
			if (val.availableQuantity === null || val.availableQuantity === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Available quantity is required for non-UNIQUE resources',
					path: ['availableQuantity'],
				});
			}
			if (!val.unit) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Unit is required for non-UNIQUE resources',
					path: ['unit'],
				});
			}
			// Also check availableQuantity is not more than totalQuantity
			if (
				val.totalQuantity !== undefined &&
				val.availableQuantity !== undefined &&
				val.totalQuantity !== null &&
				val.availableQuantity !== null &&
				val.availableQuantity > val.totalQuantity
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Available quantity must be between 0 and total quantity',
					path: ['availableQuantity'],
				});
			}
		}

		// If isTrackable, latitude and longitude are required
		if (val.isTrackable) {
			if (val.latitude === null || val.latitude === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Latitude is required when resource is trackable',
					path: ['latitude'],
				});
			}
			if (val.longitude === null || val.longitude === undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Longitude is required when resource is trackable',
					path: ['longitude'],
				});
			}
		} else {
			// If not trackable, latitude and longitude must be null/undefined
			if (val.latitude !== null && val.latitude !== undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Latitude must be empty when resource is not trackable',
					path: ['latitude'],
				});
			}
			if (val.longitude !== null && val.longitude !== undefined) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Longitude must be empty when resource is not trackable',
					path: ['longitude'],
				});
			}
		}
	});

export type ResourceRequestValues = z.infer<typeof resourceRequestSchema>;
export type ResourceFormDataValidated = ResourceRequestValues;
