import { z } from 'zod';
import { ALL_ROLES, DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES } from '@/types/role';
import {
	responderProfileSchema,
	responderProfileCreateSchema,
} from '@/validation/responderProfileValidation';

const roleSchema = z
	.object({
		roleType: z.enum(ALL_ROLES),
		departmentId: z.number().nullable(),
		municipalityId: z.number().nullable(),
		regionId: z.number().nullable(),
	})
	.superRefine((role, ctx) => {
		// Enforce: each role can have 0 or 1 entity ID, and only the allowed one for its type
		const ids = [role.departmentId, role.municipalityId, role.regionId].filter(
			(v): v is number => v !== null && v !== undefined
		);
		if (ids.length > 1) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'A role may have at most one related entity ID',
				path: ['departmentId'],
			});
		}

		const roleType = role.roleType;
		const isDept = (DEPARTMENT_ROLES as readonly (typeof ALL_ROLES)[number][]).includes(roleType);
		const isMuni = (MUNICIPALITY_ROLES as readonly (typeof ALL_ROLES)[number][]).includes(roleType);
		const isRegion = (REGION_ROLES as readonly (typeof ALL_ROLES)[number][]).includes(roleType);

		if (isDept) {
			if (role.departmentId === null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Department ID is required for this role',
					path: ['departmentId'],
				});
			if (role.municipalityId !== null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Municipality ID is not applicable for this role',
					path: ['municipalityId'],
				});
			if (role.regionId !== null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Region ID is not applicable for this role',
					path: ['regionId'],
				});
		} else if (isMuni) {
			// Require municipalityId and forbid others
			if (role.municipalityId === null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Municipality ID is required for this role',
					path: ['municipalityId'],
				});
			if (role.departmentId !== null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Department ID is not applicable for this role',
					path: ['departmentId'],
				});
			if (role.regionId !== null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Region ID is not applicable for this role',
					path: ['regionId'],
				});
		} else if (isRegion) {
			// Require regionId and forbid others
			if (role.regionId === null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Region ID is required for this role',
					path: ['regionId'],
				});
			if (role.departmentId !== null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Department ID is not applicable for this role',
					path: ['departmentId'],
				});
			if (role.municipalityId !== null)
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Municipality ID is not applicable for this role',
					path: ['municipalityId'],
				});
		} else {
			// Roles with no related entity (e.g., Citizen) must not have any ids
			if (ids.length > 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'This role should not have a related entity ID',
				});
			}
		}
	});

const userBaseSchema = z.object({
	firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
	lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
	email: z.string().email('Invalid email address'),
	mobile: z.string().regex(/^(\+\d{1,3})?\d{9,15}$/, 'Invalid mobile number format'),
	roles: z.array(roleSchema).min(1, 'At least one role is required'),
	responderProfile: responderProfileSchema.optional(),
});

function addResponderProfileCheck<T extends z.ZodTypeAny>(schema: T) {
	return schema.superRefine((data: z.infer<T>, ctx) => {
		const hasResponderRole =
			Array.isArray(data.roles) &&
			data.roles.some((r: { roleType: string }) => r.roleType === 'Responder');
		if (hasResponderRole && !data.responderProfile) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Responder profile is required for users with the Responder role',
				path: ['responderProfile'],
			});
		}
	});
}

const strongPassword = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.regex(
		/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
		'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
	);

export const userCreateFormSchema = addResponderProfileCheck(
	userBaseSchema.extend({
		responderProfile: responderProfileCreateSchema.optional(),
		password: strongPassword,
	})
);

export const userEditFormSchema = addResponderProfileCheck(
	userBaseSchema.extend({
		password: z.union([z.literal(''), strongPassword]),
	})
);

export type UserFormValues = z.infer<typeof userCreateFormSchema>;
