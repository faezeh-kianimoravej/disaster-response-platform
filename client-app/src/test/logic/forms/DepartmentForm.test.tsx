import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepartmentForm from '@/components/forms/DepartmentForm';
import type { Department } from '@/types/department';
import { renderWithProviders } from '@/test/utils';

// Mocks for useDepartment hooks (create/update)
const mockCreate = {
	// Keep typing simple for build: we don't need generics here
	mutateAsync: vi.fn(),
};
const mockUpdate = {
	// Keep typing simple for build: we don't need generics here
	mutateAsync: vi.fn(),
};

vi.mock('@/hooks/useDepartment', () => ({
	useCreateDepartment: () => mockCreate,
	useUpdateDepartment: () => mockUpdate,
}));

const baseProps = {
	isNewDepartment: true,
	municipalityId: 10,
};

describe('DepartmentForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows client validation error when required fields are missing', async () => {
		renderWithProviders(<DepartmentForm {...baseProps} />);

		// Submit without filling name
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		// Zod error should appear for name
		expect(await screen.findByText(/Department name is required/i)).toBeInTheDocument();
		// No API call attempted
		expect(mockCreate.mutateAsync).not.toHaveBeenCalled();
	});

	it('submits successfully for create and calls onSuccess', async () => {
		const onSuccess = vi.fn();
		const saved: Department = {
			departmentId: 101,
			municipalityId: 10,
			name: 'Fire Dept',
			image: '/images/default.png',
		};
		mockCreate.mutateAsync.mockResolvedValueOnce(saved);

		renderWithProviders(<DepartmentForm {...baseProps} onSuccess={onSuccess} />);

		// Fill name
		await userEvent.type(screen.getByLabelText(/Department Name/i), 'Fire Dept');

		// Submit
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		// Wait for async submission to complete
		await waitFor(() => {
			expect(mockCreate.mutateAsync).toHaveBeenCalledWith({
				name: 'Fire Dept',
				image: '/images/default.png',
				municipalityId: 10,
			});
		});
		expect(onSuccess).toHaveBeenCalledWith(saved);
	});

	it('applies server validation errors from API and calls onFailure', async () => {
		const onFailure = vi.fn();
		mockCreate.mutateAsync.mockRejectedValueOnce({
			validationErrors: { name: 'Server says name invalid' },
		});

		renderWithProviders(<DepartmentForm {...baseProps} onFailure={onFailure} />);

		// Fill field to trigger submit flow
		await userEvent.type(screen.getByLabelText(/Department Name/i), 'x');
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		// Field-level error should be rendered from server
		expect(await screen.findByText(/Server says name invalid/i)).toBeInTheDocument();
		expect(onFailure).toHaveBeenCalled();
	});

	it('shows toast on non-validation error and calls onFailure', async () => {
		const onFailure = vi.fn();
		mockCreate.mutateAsync.mockRejectedValueOnce({ message: 'Boom' });

		renderWithProviders(<DepartmentForm {...baseProps} onFailure={onFailure} />);

		await userEvent.type(screen.getByLabelText(/Department Name/i), 'Dept');
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		// Toast should render error message somewhere in the toast container
		expect(await screen.findByText(/Boom/i)).toBeInTheDocument();
		expect(onFailure).toHaveBeenCalled();
	});

	it('updates existing department when isNewDepartment=false', async () => {
		const onSuccess = vi.fn();
		const initial: Partial<Department> = {
			departmentId: 55,
			municipalityId: 10,
			name: 'Police',
			image: '/images/default.png',
		};
		const updated: Department = {
			departmentId: 55,
			municipalityId: 10,
			name: 'Police Updated',
			image: '/images/default.png',
		};

		mockUpdate.mutateAsync.mockResolvedValueOnce(updated);

		renderWithProviders(
			<DepartmentForm
				initialData={initial}
				isNewDepartment={false}
				municipalityId={10}
				onSuccess={onSuccess}
			/>
		);

		// Change the name
		const nameInput = screen.getByLabelText(/Department Name/i);
		// Clear existing and type new
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, 'Police Updated');

		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		// Wait for async submission to complete
		await waitFor(() => {
			expect(mockUpdate.mutateAsync).toHaveBeenCalledWith({
				id: 55,
				data: {
					name: 'Police Updated',
					image: '/images/default.png',
					municipalityId: 10,
				},
			});
		});
		expect(onSuccess).toHaveBeenCalledWith(updated);
	});
});
