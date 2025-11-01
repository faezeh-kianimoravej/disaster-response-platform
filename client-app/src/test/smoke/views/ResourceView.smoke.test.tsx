import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import ResourceView from '@/components/views/ResourceView';
import type { Resource } from '@/types/resource';
import { renderWithProviders } from '@/test/utils';

const mockResource: Resource = {
	resourceId: 1,
	departmentId: 10,
	name: 'Fire Truck',
	description: 'Heavy rescue vehicle',
	quantity: 5,
	available: 3,
	resourceType: 'Vehicle',
	image: '/images/default.png',
};

describe('ResourceView (smoke)', () => {
	it('renders with resource data and action buttons', () => {
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		const onBack = vi.fn();

		renderWithProviders(
			<ResourceView resource={mockResource} onEdit={onEdit} onDelete={onDelete} onBack={onBack} />
		);

		// Resource name and description should be visible
		expect(screen.getByText('Fire Truck')).toBeInTheDocument();
		expect(screen.getByText('Heavy rescue vehicle')).toBeInTheDocument();

		// Resource details should be visible
		expect(screen.getByText(/Quantity:/i)).toBeInTheDocument();
		expect(screen.getByText(/5/)).toBeInTheDocument();
		expect(screen.getByText(/Available:/i)).toBeInTheDocument();
		expect(screen.getByText(/3/)).toBeInTheDocument();
		expect(screen.getByText(/Type:/i)).toBeInTheDocument();

		// Action buttons should be present
		expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
	});
});
