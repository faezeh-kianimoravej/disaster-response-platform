import { z } from 'zod';
import { INCIDENT_SEVERITIES } from '@/types/incident';

export const incidentRequestSchema = z.object({
	incidentId: z.number().int(),
	reportedBy: z.string().min(1, { message: 'reportedBy is required' }),
	title: z.string().min(1, { message: 'title is required' }),
	description: z.string().optional(),
	severity: z.enum(INCIDENT_SEVERITIES),
	gripLevel: z
		.number()
		.int()
		.min(0, { message: 'GRIP level must be between 0 and 5' })
		.max(5, { message: 'GRIP level must be between 0 and 5' }),
	status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
	reportedAt: z.union([z.string(), z.date()]),
	location: z.string().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	regionId: z.number().int(),
	createdAt: z.union([z.string(), z.date()]).optional(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
});

export type IncidentRequestValues = z.infer<typeof incidentRequestSchema>;

export default incidentRequestSchema;
