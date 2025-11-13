import { z } from 'zod';
import { RESPONDER_SPECIALIZATIONS } from '@/types/responderSpecialization';

export const responderProfileSchema = z.object({
	userId: z.number().min(1),
	departmentId: z.number().min(1),
	primarySpecialization: z.enum(RESPONDER_SPECIALIZATIONS),
	secondarySpecializations: z.array(z.enum(RESPONDER_SPECIALIZATIONS)).optional(),
	isAvailable: z.boolean(),
	currentDeploymentId: z.number().min(1).optional(),
});
