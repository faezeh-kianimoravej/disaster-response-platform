import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RHFCheckboxGroup from '../../../components/forms/rhf/RHFCheckboxGroup';
import { useForm, FormProvider } from 'react-hook-form';

describe('RHFCheckboxGroup', () => {
	it('renders options and toggles state', async () => {
		const options = [
			{ value: 'a', label: 'Option A' },
			{ value: 'b', label: 'Option B' },
		];

		function TestWrapper() {
			const methods = useForm({ defaultValues: { roles: [] } });
			return (
				<FormProvider {...methods}>
					<RHFCheckboxGroup name="roles" options={options} label="Roles" />
				</FormProvider>
			);
		}

		render(<TestWrapper />);

		expect(screen.getByText('Roles')).toBeTruthy();
		const optA = screen.getByTitle('Option A');
		// click label to toggle
		fireEvent.click(optA);
		const input = optA.querySelector('input');
		expect(input).toBeTruthy();
		// The input should now be checked and form value updated
		expect((input as HTMLInputElement).checked).toBe(true);
		// verify form values via DOM: the checked input value should be present
		expect((input as HTMLInputElement).value).toBe('a');
	});
});
