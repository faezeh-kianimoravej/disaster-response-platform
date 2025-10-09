import { describe, it, expect } from 'vitest';
import {
	createValidationRule,
	validateRequired,
	validateEmail,
	validateMinLength,
	validateMaxLength,
	validateNumberRange,
	validateMinValue,
	validateMaxValue,
	isFormValid,
} from '../utils/validation';

describe('validation utilities', () => {
	describe('createValidationRule', () => {
		it('should create a valid validation rule', () => {
			const rule = createValidationRule(true, 'Success');
			expect(rule).toEqual({
				isValid: true,
				message: 'Success',
			});
		});

		it('should create an invalid validation rule', () => {
			const rule = createValidationRule(false, 'Error message');
			expect(rule).toEqual({
				isValid: false,
				message: 'Error message',
			});
		});
	});

	describe('validateRequired', () => {
		it('should pass for non-empty strings', () => {
			const result = validateRequired('hello', 'Name');
			expect(result.isValid).toBe(true);
			expect(result.message).toBe('Name is required');
		});

		it('should fail for empty strings', () => {
			const result = validateRequired('', 'Name');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Name is required');
		});

		it('should fail for whitespace-only strings', () => {
			const result = validateRequired('   ', 'Name');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Name is required');
		});

		it('should use default field name', () => {
			const result = validateRequired('');
			expect(result.message).toBe('Field is required');
		});
	});

	describe('validateEmail', () => {
		it('should pass for valid email addresses', () => {
			const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'user+tag@domain.org'];

			validEmails.forEach(email => {
				const result = validateEmail(email);
				expect(result.isValid).toBe(true);
			});
		});

		it('should fail for invalid email addresses', () => {
			const invalidEmails = ['not-an-email', '@domain.com', 'user@', 'user@domain', ''];

			invalidEmails.forEach(email => {
				const result = validateEmail(email);
				expect(result.isValid).toBe(false);
				expect(result.message).toBe('Please enter a valid email address');
			});
		});
	});

	describe('validateMinLength', () => {
		it('should pass when value meets minimum length', () => {
			const result = validateMinLength('hello', 3, 'Password');
			expect(result.isValid).toBe(true);
		});

		it('should fail when value is too short', () => {
			const result = validateMinLength('hi', 3, 'Password');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Password must be at least 3 characters');
		});

		it('should use default field name', () => {
			const result = validateMinLength('hi', 5);
			expect(result.message).toBe('Field must be at least 5 characters');
		});
	});

	describe('validateMaxLength', () => {
		it('should pass when value is within maximum length', () => {
			const result = validateMaxLength('hello', 10, 'Username');
			expect(result.isValid).toBe(true);
		});

		it('should fail when value exceeds maximum length', () => {
			const result = validateMaxLength('verylongusername', 8, 'Username');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Username must be no more than 8 characters');
		});
	});

	describe('validateNumberRange', () => {
		it('should pass when number is within range', () => {
			const result = validateNumberRange(5, 1, 10, 'Age');
			expect(result.isValid).toBe(true);
		});

		it('should fail when number is below minimum', () => {
			const result = validateNumberRange(0, 1, 10, 'Age');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Age must be between 1 and 10');
		});

		it('should fail when number is above maximum', () => {
			const result = validateNumberRange(15, 1, 10, 'Age');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Age must be between 1 and 10');
		});
	});

	describe('validateMinValue', () => {
		it('should pass when value meets minimum', () => {
			const result = validateMinValue(5, 3, 'Quantity');
			expect(result.isValid).toBe(true);
		});

		it('should fail when value is below minimum', () => {
			const result = validateMinValue(2, 3, 'Quantity');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Quantity must be at least 3');
		});
	});

	describe('validateMaxValue', () => {
		it('should pass when value is within maximum', () => {
			const result = validateMaxValue(8, 10, 'Score');
			expect(result.isValid).toBe(true);
		});

		it('should fail when value exceeds maximum', () => {
			const result = validateMaxValue(15, 10, 'Score');
			expect(result.isValid).toBe(false);
			expect(result.message).toBe('Score cannot exceed 10');
		});
	});

	describe('isFormValid', () => {
		it('should return true when all validations pass', () => {
			const validation = {
				name: createValidationRule(true, ''),
				email: createValidationRule(true, ''),
				age: createValidationRule(true, ''),
			};

			expect(isFormValid(validation)).toBe(true);
		});

		it('should return false when any validation fails', () => {
			const validation = {
				name: createValidationRule(true, ''),
				email: createValidationRule(false, 'Invalid email'),
				age: createValidationRule(true, ''),
			};

			expect(isFormValid(validation)).toBe(false);
		});

		it('should return false when all validations fail', () => {
			const validation = {
				name: createValidationRule(false, 'Required'),
				email: createValidationRule(false, 'Invalid email'),
			};

			expect(isFormValid(validation)).toBe(false);
		});
	});
});
