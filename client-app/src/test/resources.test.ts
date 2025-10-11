import { describe, it, expect } from 'vitest';
import { validateResource } from '../validation/resourceValidation';
import type { ResourceFormData } from '../types/resource';

describe('resource validation', () => {
	const validResourceData: ResourceFormData = {
		name: 'Test Resource',
		description: 'A test resource',
		quantity: 10,
		available: 8,
		resourceType: 'Medical',
		departmentId: 101,
		image: '/images/test.png',
	};

	describe('validateResource', () => {
		it('should pass validation for valid resource data', () => {
			const result = validateResource(validResourceData);

			expect(result.name.isValid).toBe(true);
			expect(result.quantity.isValid).toBe(true);
			expect(result.available.isValid).toBe(true);
			expect(result.departmentId.isValid).toBe(true);
			expect(result.image.isValid).toBe(true);
		});

		describe('name validation', () => {
			it('should fail when name is empty', () => {
				const data = { ...validResourceData, name: '' };
				const result = validateResource(data);

				expect(result.name.isValid).toBe(false);
				expect(result.name.message).toBe('Resource name is required');
			});

			it('should fail when name is only whitespace', () => {
				const data = { ...validResourceData, name: '   ' };
				const result = validateResource(data);

				expect(result.name.isValid).toBe(false);
				expect(result.name.message).toBe('Resource name is required');
			});

			it('should pass when name is valid', () => {
				const data = { ...validResourceData, name: 'Medical Supplies' };
				const result = validateResource(data);

				expect(result.name.isValid).toBe(true);
			});
		});

		describe('quantity validation', () => {
			it('should fail when quantity is 0', () => {
				const data = { ...validResourceData, quantity: 0 };
				const result = validateResource(data);

				expect(result.quantity.isValid).toBe(false);
				expect(result.quantity.message).toBe('Quantity must be at least 1');
			});

			it('should fail when quantity is negative', () => {
				const data = { ...validResourceData, quantity: -5 };
				const result = validateResource(data);

				expect(result.quantity.isValid).toBe(false);
				expect(result.quantity.message).toBe('Quantity must be at least 1');
			});

			it('should pass when quantity is positive', () => {
				const data = { ...validResourceData, quantity: 100 };
				const result = validateResource(data);

				expect(result.quantity.isValid).toBe(true);
			});
		});

		describe('available validation', () => {
			it('should fail when available is negative', () => {
				const data = { ...validResourceData, available: -1 };
				const result = validateResource(data);

				expect(result.available.isValid).toBe(false);
				expect(result.available.message).toBe('Available must be between 0 and quantity');
			});

			it('should fail when available exceeds quantity', () => {
				const data = { ...validResourceData, quantity: 10, available: 15 };
				const result = validateResource(data);

				expect(result.available.isValid).toBe(false);
				expect(result.available.message).toBe('Available must be between 0 and quantity');
			});

			it('should pass when available equals quantity', () => {
				const data = { ...validResourceData, quantity: 10, available: 10 };
				const result = validateResource(data);

				expect(result.available.isValid).toBe(true);
			});

			it('should pass when available is 0', () => {
				const data = { ...validResourceData, available: 0 };
				const result = validateResource(data);

				expect(result.available.isValid).toBe(true);
			});

			it('should pass when available is between 0 and quantity', () => {
				const data = { ...validResourceData, quantity: 20, available: 15 };
				const result = validateResource(data);

				expect(result.available.isValid).toBe(true);
			});
		});

		describe('departmentId validation', () => {
			it('should fail when departmentId is 0', () => {
				const data = { ...validResourceData, departmentId: 0 };
				const result = validateResource(data);

				expect(result.departmentId.isValid).toBe(false);
				expect(result.departmentId.message).toBe('Department ID must be at least 1');
			});

			it('should fail when departmentId is negative', () => {
				const data = { ...validResourceData, departmentId: -1 };
				const result = validateResource(data);

				expect(result.departmentId.isValid).toBe(false);
				expect(result.departmentId.message).toBe('Department ID must be at least 1');
			});

			it('should pass when departmentId is positive', () => {
				const data = { ...validResourceData, departmentId: 123 };
				const result = validateResource(data);

				expect(result.departmentId.isValid).toBe(true);
			});
		});

		describe('image validation', () => {
			it('should fail when image is empty', () => {
				const data = { ...validResourceData, image: '' };
				const result = validateResource(data);

				expect(result.image.isValid).toBe(false);
				expect(result.image.message).toBe('Image is required');
			});

			it('should fail when image is only whitespace', () => {
				const data = { ...validResourceData, image: '   ' };
				const result = validateResource(data);

				expect(result.image.isValid).toBe(false);
				expect(result.image.message).toBe('Image is required');
			});

			it('should pass when image path is provided', () => {
				const data = { ...validResourceData, image: '/images/medical.png' };
				const result = validateResource(data);

				expect(result.image.isValid).toBe(true);
			});
		});

		describe('multiple validation failures', () => {
			it('should handle multiple validation failures correctly', () => {
				const invalidData: ResourceFormData = {
					name: '',
					description: 'Test description',
					quantity: 0,
					available: -1,
					resourceType: 'Medical',
					departmentId: 0,
					image: '',
				};

				const result = validateResource(invalidData);

				expect(result.name.isValid).toBe(false);
				expect(result.quantity.isValid).toBe(false);
				expect(result.available.isValid).toBe(false);
				expect(result.departmentId.isValid).toBe(false);
				expect(result.image.isValid).toBe(false);
			});
		});

		describe('edge cases', () => {
			it('should handle very large numbers correctly', () => {
				const data = {
					...validResourceData,
					quantity: 999999,
					available: 999999,
					departmentId: 999999,
				};
				const result = validateResource(data);

				expect(result.quantity.isValid).toBe(true);
				expect(result.available.isValid).toBe(true);
				expect(result.departmentId.isValid).toBe(true);
			});

			it('should handle minimum valid values', () => {
				const data = {
					...validResourceData,
					quantity: 1,
					available: 0,
					departmentId: 1,
				};
				const result = validateResource(data);

				expect(result.quantity.isValid).toBe(true);
				expect(result.available.isValid).toBe(true);
				expect(result.departmentId.isValid).toBe(true);
			});
		});
	});
});
