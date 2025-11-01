import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import RHFSelect from '@/components/forms/rhf/RHFSelect';

type F = { qty: number };

function SelectForm() {
	const methods = useForm<F>({ defaultValues: { qty: 1 } });
	return (
		<FormProvider {...methods}>
			<Inner />
		</FormProvider>
	);
}

function Inner() {
	const { watch } = useFormContext<F>();
	const qty = watch('qty');
	return (
		<div>
			<p data-testid="qty">{qty}</p>
			<RHFSelect<F>
				name={'qty'}
				label="Quantity"
				options={[
					{ value: 1, label: '1' },
					{ value: 2, label: '2' },
					{ value: 3, label: '3' },
				]}
				valueType="number"
			/>
		</div>
	);
}

describe('RHFSelect smoke', () => {
	it('renders and updates numeric value', () => {
		render(<SelectForm />);
		const select = screen.getByLabelText(/quantity/i) as HTMLSelectElement;
		expect(screen.getByTestId('qty').textContent).toBe('1');
		fireEvent.change(select, { target: { value: '3' } });
		expect(screen.getByTestId('qty').textContent).toBe('3');
	});
});
