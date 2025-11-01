import { z } from 'zod';
import { INCIDENT_SEVERITIES } from '@/types/incident';

export const incidentRequestSchema = z.object({
	incidentId: z.coerce.number().int().min(1, { message: 'Incident ID must be 1 or higher' }),
	reportedBy: z.string().min(1, { message: 'reportedBy is required' }),
	title: z.string().min(1, { message: 'title is required' }),
	description: z.string().optional(),
	severity: z.enum(INCIDENT_SEVERITIES),
	gripLevel: z.coerce
		.number()
		.int()
		.min(0, { message: 'GRIP level must be between 0 and 5' })
		.max(5, { message: 'GRIP level must be between 0 and 5' }),
	status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
	reportedAt: z.union([z.string(), z.date()]),
	location: z.string().optional(),
	latitude: z.coerce
		.number()
		.min(-90, { message: 'Latitude must be between -90 and 90' })
		.max(90, { message: 'Latitude must be between -90 and 90' })
		.optional(),
	longitude: z.coerce
		.number()
		.min(-180, { message: 'Longitude must be between -180 and 180' })
		.max(180, { message: 'Longitude must be between -180 and 180' })
		.optional(),
	regionId: z.coerce.number().int().min(1, { message: 'Region ID must be 1 or higher' }),
	createdAt: z.union([z.string(), z.date()]).optional(),
	updatedAt: z.union([z.string(), z.date()]).optional(),
});

export type IncidentRequestValues = z.infer<typeof incidentRequestSchema>;

export default incidentRequestSchema;
