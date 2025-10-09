// Generic validation types and utilities
export interface ValidationRule {
	isValid: boolean;
	message: string;
}

export type ValidationResult<T> = {
	[K in keyof T]: ValidationRule;
};

// Generic validation utility functions
export function isFormValid<T>(validation: ValidationResult<T>): boolean {
	return (Object.values(validation) as ValidationRule[]).every(rule => rule.isValid);
}

export function createValidationRule(isValid: boolean, message: string): ValidationRule {
	return { isValid, message };
}

// Common validation functions that can be reused
export function validateRequired(value: string, fieldName: string = 'Field'): ValidationRule {
	return createValidationRule(Boolean(value && value.trim() !== ''), `${fieldName} is required`);
}

export function validateEmail(email: string): ValidationRule {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return createValidationRule(emailRegex.test(email), 'Please enter a valid email address');
}

export function validateMinLength(
	value: string,
	minLength: number,
	fieldName: string = 'Field'
): ValidationRule {
	return createValidationRule(
		value.length >= minLength,
		`${fieldName} must be at least ${minLength} characters`
	);
}

export function validateMaxLength(
	value: string,
	maxLength: number,
	fieldName: string = 'Field'
): ValidationRule {
	return createValidationRule(
		value.length <= maxLength,
		`${fieldName} must be no more than ${maxLength} characters`
	);
}

export function validateNumberRange(
	value: number,
	min: number,
	max: number,
	fieldName: string = 'Value'
): ValidationRule {
	return createValidationRule(
		value >= min && value <= max,
		`${fieldName} must be between ${min} and ${max}`
	);
}

export function validateMinValue(
	value: number,
	min: number,
	fieldName: string = 'Value'
): ValidationRule {
	return createValidationRule(value >= min, `${fieldName} must be at least ${min}`);
}

export function validateMaxValue(
	value: number,
	max: number,
	fieldName: string = 'Value'
): ValidationRule {
	return createValidationRule(value <= max, `${fieldName} cannot exceed ${max}`);
}
