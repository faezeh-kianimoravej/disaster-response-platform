import type { ValidationResult } from '@/utils/validation';
import type { ApiError } from '@/api/base';

/**
 * Merges backend validation errors into a frontend validation result object.
 * @param frontendValidation The result of frontend validation.
 * @param apiError The ApiError object from the backend.
 * @returns The merged validation result.
 */
export function mergeBackendValidation<T extends object>(
	frontendValidation: ValidationResult<T>,
	apiError: ApiError
): ValidationResult<T> {
	if (!apiError.validationErrors) return frontendValidation;
	const merged = { ...frontendValidation };
	for (const key in apiError.validationErrors) {
		if (Object.prototype.hasOwnProperty.call(merged, key)) {
			merged[key as keyof T] = {
				isValid: false,
				message: apiError.validationErrors[key] || 'Invalid',
			};
		}
	}
	return merged;
}
