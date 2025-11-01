import { describe, it, expect, vi } from 'vitest';
import { applyServerValidation } from '@/utils/applyServerValidation';
import type { UseFormSetError, FieldError } from 'react-hook-form';

type FormShape = {
	name: string;
	quantity: number;
	image?: string;
};

describe('applyServerValidation', () => {
	it('sets errors for all fields with messages', () => {
		const calls: Array<{ name: string; error: Pick<FieldError, 'message'> }> = [];
		const setError = vi.fn(((name: keyof FormShape, error: FieldError) => {
			calls.push({ name: String(name), error });
		}) as unknown as UseFormSetError<FormShape>);

		applyServerValidation<FormShape>(setError, {
			name: 'Name is required',
			quantity: 'Quantity must be positive',
			image: 'Image is required',
		});

		expect(setError).toHaveBeenCalledTimes(3);
		expect(calls.map(c => c.name)).toEqual(['name', 'quantity', 'image']);
		expect(calls.map(c => c.error.message)).toEqual([
			'Name is required',
			'Quantity must be positive',
			'Image is required',
		]);
	});

	it('does nothing when validation is null', () => {
		const setError = vi.fn();
		applyServerValidation<FormShape>(setError as unknown as UseFormSetError<FormShape>, null);
		expect(setError).not.toHaveBeenCalled();
	});
});
