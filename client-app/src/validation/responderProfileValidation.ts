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

// Relaxed schema for create flows: fully optional, validated only when Responder role is selected
export const responderProfileCreateSchema = z
	.object({
		userId: z.number().min(1).optional(),
		departmentId: z.number().min(1).optional().nullable(),
		primarySpecialization: z.enum(RESPONDER_SPECIALIZATIONS).optional(),
		secondarySpecializations: z.array(z.enum(RESPONDER_SPECIALIZATIONS)).optional(),
		isAvailable: z.boolean().optional().default(true),
	})
	.optional();
