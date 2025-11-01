import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import DepartmentView from '@/components/views/DepartmentView';
import type { Department } from '@/types/department';
import { renderWithProviders } from '@/test/utils';

const mockDepartment: Department = {
	departmentId: 1,
	municipalityId: 10,
	name: 'Fire Department',
	image: '/images/default.png',
};

describe('DepartmentView (smoke)', () => {
	it('renders with department data and action buttons', () => {
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		const onBack = vi.fn();

		renderWithProviders(
			<DepartmentView
				department={mockDepartment}
				onEdit={onEdit}
				onDelete={onDelete}
				onBack={onBack}
			/>
		);

		// Department name should be visible
		expect(screen.getByText('Fire Department')).toBeInTheDocument();

		// Action buttons should be present
		expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();

		// Image should be rendered
		const img = screen.getByRole('img', { name: /Fire Department/i });
		expect(img).toBeInTheDocument();
	});

	it('renders not found message when department is null', () => {
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		const onBack = vi.fn();

		renderWithProviders(
			<DepartmentView department={null} onEdit={onEdit} onDelete={onDelete} onBack={onBack} />
		);

		// Should show error message
		expect(screen.getByText(/Department information not found/i)).toBeInTheDocument();
		expect(screen.getByText(/The requested department could not be loaded/i)).toBeInTheDocument();

		// Action buttons should still be present
		expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
	});
});
