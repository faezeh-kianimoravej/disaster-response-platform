import { z } from 'zod';

export const deploymentAllocationSchema = z
	.object({
		requestId: z.coerce.number().int().min(1, 'Request ID is required'),
		assignedBy: z.coerce.number().int().min(1, 'Assigned by is required'),
		assignedUsers: z.array(z.coerce.number().int().min(1, 'User ID must be valid')).optional(),
		assignedResources: z
			.array(
				z.object({
					resourceId: z.coerce.number().int().min(1, 'Resource ID must be valid'),
					quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
				})
			)
			.optional(),
	})
	.superRefine((val, ctx) => {
		// Validate assignedUsers array if provided
		if (val.assignedUsers !== undefined && val.assignedUsers.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Assigned users cannot be empty if provided',
				path: ['assignedUsers'],
			});
		}

		// Validate assignedResources array if provided
		if (val.assignedResources !== undefined && val.assignedResources.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Assigned resources cannot be empty if provided',
				path: ['assignedResources'],
			});
		}

		// At least one of assignedUsers or assignedResources must be non-empty
		const hasUsers = val.assignedUsers && val.assignedUsers.length > 0;
		const hasResources = val.assignedResources && val.assignedResources.length > 0;

		if (!hasUsers && !hasResources) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'At least one user or resource must be assigned',
				path: ['assignedUsers'],
			});
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'At least one user or resource must be assigned',
				path: ['assignedResources'],
			});
		}

		// Additional validation for resource quantities (redundant check for safety)
		if (val.assignedResources) {
			val.assignedResources.forEach((resource, index) => {
				if (resource.quantity <= 0) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Quantity must be greater than 0',
						path: ['assignedResources', index, 'quantity'],
					});
				}
			});
		}
	});

export type DeploymentAllocationValues = z.infer<typeof deploymentAllocationSchema>;
export type DeploymentAllocationFormData = DeploymentAllocationValues;
