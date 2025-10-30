import { Role } from '@/types/role';
import type { UserCreateFormData, UserEditFormData } from '@/types/user';
import type { ValidationResult } from '@/utils/validation';
import {
	validateRequired,
	validateEmail,
	validateMobile,
	validateMinLength,
	createValidationRule,
	validateMinValue,
} from '@/utils/validation';
type UserValidationFields = Pick<
	UserCreateFormData,
	| 'firstName'
	| 'lastName'
	| 'email'
	| 'mobile'
	| 'password'
	| 'roles'
	| 'departmentId'
	| 'regionId'
	| 'municipalityId'
>;

export function validateUserForm(
	data: UserCreateFormData | UserEditFormData
): ValidationResult<UserValidationFields> {
	const filled = [data.departmentId, data.regionId, data.municipalityId].filter(
		v => typeof v === 'number' && v > 0
	);
	let departmentId, regionId, municipalityId;
	if (filled.length > 1) {
		departmentId =
			regionId =
			municipalityId =
				{
					isValid: false,
					message: 'Only one of Department, Region, or Municipality can be chosen',
				};
	} else {
		departmentId =
			typeof data.departmentId === 'number' && data.departmentId > 0
				? validateMinValue(data.departmentId, 1, 'Department')
				: { isValid: true, message: '' };
		regionId =
			typeof data.regionId === 'number' && data.regionId > 0
				? validateMinValue(data.regionId, 1, 'Region')
				: { isValid: true, message: '' };
		municipalityId =
			typeof data.municipalityId === 'number' && data.municipalityId > 0
				? validateMinValue(data.municipalityId, 1, 'Municipality')
				: { isValid: true, message: '' };
	}

	const roleEntityMap: Record<Role, 'department' | 'municipality' | 'region' | 'none'> = {
		Citizen: 'none',
		Responder: 'department',
		'Officer on Duty': 'department',
		'Leader CoPI': 'department',
		'Calamity Coordinator': 'region',
		'Operational Leader': 'region',
		Mayor: 'municipality',
		'Chair Safety Region': 'region',
		'Department Admin': 'department',
		'Municipality Admin': 'municipality',
		'Region Admin': 'region',
		'Super Admin': 'none',
	};

	const roleEntityErrors: string[] = [];
	(data.roles || []).forEach(role => {
		const required = roleEntityMap[role];
		if (
			required === 'department' &&
			!(typeof data.departmentId === 'number' && data.departmentId > 0)
		) {
			roleEntityErrors.push(`${role} requires a Department to be selected.`);
		}
		if (
			required === 'municipality' &&
			!(typeof data.municipalityId === 'number' && data.municipalityId > 0)
		) {
			roleEntityErrors.push(`${role} requires a Municipality to be selected.`);
		}
		if (required === 'region' && !(typeof data.regionId === 'number' && data.regionId > 0)) {
			roleEntityErrors.push(`${role} requires a Region to be selected.`);
		}
		if (required === 'none' && (data.departmentId || data.municipalityId || data.regionId)) {
			roleEntityErrors.push(
				`${role} should not be linked to a Department, Municipality, or Region.`
			);
		}
	});

	return {
		firstName: validateRequired(data.firstName, 'First name'),
		lastName: validateRequired(data.lastName, 'Last name'),
		email: validateEmail(data.email),
		mobile: validateMobile(data.mobile),
		password:
			!data.password || data.password.trim() === ''
				? validateRequired(data.password, 'Password')
				: validateMinLength(data.password, 8, 'Password'),
		roles:
			roleEntityErrors.length > 0
				? { isValid: false, message: roleEntityErrors.join(' ') }
				: createValidationRule(
						Array.isArray(data.roles) && data.roles.length > 0,
						'At least one role must be selected'
					),
		departmentId,
		regionId,
		municipalityId,
	};
}
