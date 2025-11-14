import { describe, it, expect, vi } from 'vitest';
import ResourcePage from '@/pages/ResourcePage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Hook mocks configurable per-test
const mockUseResource = vi.fn();
const mockUseDeleteResource = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockUseCreateResource = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockUseUpdateResource = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });

vi.mock('@/hooks/useResource', () => ({
	useResource: (...args: unknown[]) => mockUseResource(...args),
	useDeleteResource: (...args: unknown[]) => mockUseDeleteResource(...args),
	useCreateResource: (...args: unknown[]) => mockUseCreateResource(...args),
	useUpdateResource: (...args: unknown[]) => mockUseUpdateResource(...args),
}));

describe('ResourcePage (smoke)', () => {
	it('renders create form when new resource', () => {
		mockUseResource.mockReturnValue({
			resource: undefined,
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<ResourcePage />, { route: '/resource/new' });
		// ResourceForm shows create heading and Name input label
		expect(screen.getByRole('heading', { name: /Create New Resource/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
	});

	it('renders view when existing resource loaded', () => {
		mockUseResource.mockReturnValue({
			resource: {
				resourceId: 10,
				departmentId: 3,
				name: 'Fire Truck',
				description: 'Large vehicle',
				totalQuantity: 2,
				availableQuantity: 1,
				unit: 'PIECES',
				image: '',
				resourceType: 'FIRE_TRUCK',
				resourceKind: 'STACKABLE',
				category: 'VEHICLE',
				isTrackable: false,
				latitude: null,
				longitude: null,
			},
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<ResourcePage />, {
			route: '/resource/10',
			routePath: '/resource/:resourceId',
		});
		// Check the heading for the resource name
		const headings = screen.getAllByRole('heading', { name: 'Fire Truck' });
		expect(headings.length).toBeGreaterThanOrEqual(1);
		// Check the type label and value
		expect(screen.getByText(/Type:/i)).toBeInTheDocument();
		expect(screen.getAllByText('Fire Truck').length).toBeGreaterThanOrEqual(2);
		expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
	});
});
