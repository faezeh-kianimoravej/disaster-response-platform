import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import RHFCheckboxGroup from '@/components/forms/rhf/RHFCheckboxGroup';

function TestForm({
	defaultValues,
	name = 'roles',
}: {
	defaultValues?: Record<string, unknown>;
	name?: string;
}) {
	const methods = defaultValues ? useForm({ defaultValues }) : useForm();
	return (
		<FormProvider {...methods}>
			<RHFCheckboxGroup
				name={name}
				options={[
					{ value: 'a', label: 'Option A' },
					{ value: 'b', label: 'Option B' },
				]}
				label="Roles"
			/>
		</FormProvider>
	);
}

describe('RHFCheckboxGroup (unit)', () => {
	it('renders options and toggles state via clicks', async () => {
		render(<TestForm defaultValues={{ roles: [] }} />);

		expect(screen.getByText('Roles')).toBeTruthy();
		const optA = screen.getByTitle('Option A');
		// click label to toggle
		fireEvent.click(optA);
		const input = optA.querySelector('input');
		expect(input).toBeTruthy();
		expect((input as HTMLInputElement).checked).toBe(true);
		// clicking again toggles off
		fireEvent.click(optA);
		expect((input as HTMLInputElement).checked).toBe(false);
	});
});
