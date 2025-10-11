import type { ValidationResult } from '@/utils/validation';
import { createValidationRule, validateRequired, validateMinValue } from '@/utils/validation';
import type { ResourceFormData } from '@/types/resource';

type ResourceValidationFields = Pick<
	ResourceFormData,
	'name' | 'quantity' | 'available' | 'departmentId' | 'image'
>;

export function validateResource(
	data: ResourceFormData
): ValidationResult<ResourceValidationFields> {
	return {
		name: validateRequired(data.name, 'Resource name'),
		quantity: validateMinValue(data.quantity, 1, 'Quantity'),
		available: createValidationRule(
			data.available >= 0 && data.available <= data.quantity,
			'Available must be between 0 and quantity'
		),
		departmentId: validateMinValue(data.departmentId, 1, 'Department ID'),
		image: validateRequired(data.image, 'Image'),
	};
}
