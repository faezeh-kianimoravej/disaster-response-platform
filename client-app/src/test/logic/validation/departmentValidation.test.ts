import { describe, it, expect } from 'vitest';
import { departmentRequestSchema } from '@/validation/departmentValidation';

describe('Department Validation', () => {
	it('accepts valid department with all required fields', () => {
		const validDepartment = {
			name: 'Fire Department',
			image: 'https://example.com/fire.jpg',
			municipalityId: 1,
		};

		const result = departmentRequestSchema.safeParse(validDepartment);
		expect(result.success).toBe(true);
	});

	describe('Municipality ID validation', () => {
		it('rejects municipalityId of 0', () => {
			const department = {
				name: 'Test Department',
				image: 'https://example.com/test.jpg',
				municipalityId: 0,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('municipalityId');
				expect(issue!.message).toMatch(/must be 1 or higher/i);
			}
		});

		it('rejects negative municipalityId', () => {
			const department = {
				name: 'Test Department',
				image: 'https://example.com/test.jpg',
				municipalityId: -5,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('municipalityId');
			}
		});

		it('accepts municipalityId of 1', () => {
			const department = {
				name: 'Test Department',
				image: 'https://example.com/test.jpg',
				municipalityId: 1,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(true);
		});

		it('accepts large municipalityId values', () => {
			const department = {
				name: 'Test Department',
				image: 'https://example.com/test.jpg',
				municipalityId: 999999,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(true);
		});
	});

	describe('Name validation', () => {
		it('rejects empty name', () => {
			const department = {
				name: '',
				image: 'https://example.com/test.jpg',
				municipalityId: 1,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('name');
			}
		});

		it('accepts names with special characters', () => {
			const department = {
				name: 'Fire & Rescue Department (24/7)',
				image: 'https://example.com/test.jpg',
				municipalityId: 1,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(true);
		});
	});

	describe('Image validation', () => {
		it('rejects empty image URL', () => {
			const department = {
				name: 'Test Department',
				image: '',
				municipalityId: 1,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('image');
			}
		});

		it('accepts valid image URLs', () => {
			const department = {
				name: 'Test Department',
				image: 'https://example.com/department.png',
				municipalityId: 1,
			};

			const result = departmentRequestSchema.safeParse(department);
			expect(result.success).toBe(true);
		});
	});
});
