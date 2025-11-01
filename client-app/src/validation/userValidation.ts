import { z } from 'zod';
import type { Role } from '@/types/role';

const mobileRegex = /^[0-9+\-\s]{7,20}$/;

const roleEntityMap: Record<Role, 'department' | 'municipality' | 'region' | 'none'> = {
	Citizen: 'none',
	Responder: 'department',
	'Officer on Duty': 'department',
	'Leader CoPI': 'department',
	'Calamity Coordinator': 'region',
	'Operational Leader': 'municipality',
	Mayor: 'municipality',
	'Chair Safety Region': 'region',
	'Department Admin': 'department',
	'Municipality Admin': 'municipality',
	'Region Admin': 'region',
};

const userBaseSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email address'),
	mobile: z.string().regex(mobileRegex, 'Invalid mobile number'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	roles: z.array(z.string() as unknown as z.ZodType<Role>).min(1, 'Select at least one role'),
	departmentId: z.coerce.number().int().min(0).optional().default(0),
	municipalityId: z.coerce.number().int().min(0).optional().default(0),
	regionId: z.coerce.number().int().min(0).optional().default(0),
});

export const userCreateRequestSchema = userBaseSchema.superRefine((data, ctx) => {
	// Only one of departmentId, municipalityId, regionId may be > 0
	const picks = [data.departmentId, data.municipalityId, data.regionId].filter(v => (v ?? 0) > 0);
	if (picks.length > 1) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Only one of Department, Municipality, or Region can be chosen',
			path: ['departmentId'],
		});
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: '', path: ['municipalityId'] });
		ctx.addIssue({ code: z.ZodIssueCode.custom, message: '', path: ['regionId'] });
	}

	// Role-specific entity requirements
	(data.roles || []).forEach(role => {
		const required = roleEntityMap[role as Role];
		if (required === 'department' && (data.departmentId ?? 0) <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `${role} requires a Department to be selected.`,
				path: ['departmentId'],
			});
		}
		if (required === 'municipality' && (data.municipalityId ?? 0) <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `${role} requires a Municipality to be selected.`,
				path: ['municipalityId'],
			});
		}
		if (required === 'region' && (data.regionId ?? 0) <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `${role} requires a Region to be selected.`,
				path: ['regionId'],
			});
		}
		if (
			required === 'none' &&
			((data.departmentId ?? 0) > 0 || (data.municipalityId ?? 0) > 0 || (data.regionId ?? 0) > 0)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `${role} should not be linked to a Department, Municipality, or Region.`,
				path: ['roles'],
			});
		}
	});
});

export const userEditRequestSchema = userBaseSchema
	.extend({ userId: z.coerce.number().int().min(1, 'Invalid user id') })
	.superRefine((data, ctx) => {
		// Reuse same superRefine logic as create
		const picks = [data.departmentId, data.municipalityId, data.regionId].filter(v => (v ?? 0) > 0);
		if (picks.length > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Only one of Department, Municipality, or Region can be chosen',
				path: ['departmentId'],
			});
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: '', path: ['municipalityId'] });
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: '', path: ['regionId'] });
		}
		(data.roles || []).forEach(role => {
			const required = roleEntityMap[role as Role];
			if (required === 'department' && (data.departmentId ?? 0) <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${role} requires a Department to be selected.`,
					path: ['departmentId'],
				});
			}
			if (required === 'municipality' && (data.municipalityId ?? 0) <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${role} requires a Municipality to be selected.`,
					path: ['municipalityId'],
				});
			}
			if (required === 'region' && (data.regionId ?? 0) <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${role} requires a Region to be selected.`,
					path: ['regionId'],
				});
			}
			if (
				required === 'none' &&
				((data.departmentId ?? 0) > 0 || (data.municipalityId ?? 0) > 0 || (data.regionId ?? 0) > 0)
			) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${role} should not be linked to a Department, Municipality, or Region.`,
					path: ['roles'],
				});
			}
		});
	});

export type UserCreateRequestValues = z.infer<typeof userCreateRequestSchema>;
export type UserEditRequestValues = z.infer<typeof userEditRequestSchema>;
