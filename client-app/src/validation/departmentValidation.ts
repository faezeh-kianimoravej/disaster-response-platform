import { z } from 'zod';

export const departmentRequestSchema = z.object({
	name: z.string().min(1, { message: 'Department name is required' }),
	image: z.string().min(1, { message: 'Department image is required' }),
	municipalityId: z.coerce
		.number()
		.int()
		.min(1, { message: 'Municipality ID must be 1 or higher' }),
});

export type DepartmentRequestValues = z.infer<typeof departmentRequestSchema>;
