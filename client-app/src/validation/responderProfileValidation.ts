import { z } from 'zod';
import { RESPONDER_SPECIALIZATIONS } from '@/types/responderSpecialization';

const responderProfileBase = z.object({
	departmentId: z.number().min(1),
	primarySpecialization: z.enum(RESPONDER_SPECIALIZATIONS),
	secondarySpecializations: z.array(z.enum(RESPONDER_SPECIALIZATIONS)).default([]),
	isAvailable: z.boolean(),
	currentDeploymentId: z.number().min(1).optional(),
});

// Strict schema for edit flows (userId present)
export const responderProfileSchema = z
	.object({
		userId: z.number().min(1),
	})
	.merge(responderProfileBase);

// Relaxed schema for create flows: userId is not available yet, and isAvailable defaults to true
export const responderProfileCreateSchema = z
	.object({
		userId: z.number().min(1).optional(),
	})
	.merge(responderProfileBase.extend({ isAvailable: z.boolean().optional().default(true) }));
