import { z } from 'zod';

// Schema for search filters
export const resourceSearchFormSchema = z.object({
	resourceType: z.string().optional(),
	municipalityId: z.string().optional(),
	departmentId: z.string().optional(),
});

// Schema for individual allocation
export const allocationSchema = z.object({
	resourceId: z.number(),
	quantity: z.number().min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999'),
});

// Schema for the entire allocation form
export const resourceAllocationFormSchema = z.object({
	incidentId: z.number(),
	allocations: z.array(allocationSchema).min(1, 'At least one resource must be allocated'),
});

export type ResourceSearchFormData = z.infer<typeof resourceSearchFormSchema>;
export type AllocationData = z.infer<typeof allocationSchema>;
export type ResourceAllocationFormData = z.infer<typeof resourceAllocationFormSchema>;
