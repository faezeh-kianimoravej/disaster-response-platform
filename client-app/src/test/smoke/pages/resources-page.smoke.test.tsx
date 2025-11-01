import { describe, it, expect, vi } from 'vitest';
import ResourcesPage from '@/pages/ResourcesPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useResource', () => ({
	useResources: () => ({ resources: [], loading: false, error: null, refetch: vi.fn() }),
}));

vi.mock('@/hooks/useDepartment', () => ({
	useDepartment: () => ({ department: { municipalityId: 1 } }),
}));

describe('ResourcesPage (smoke)', () => {
	it('renders empty state and action buttons when departmentId present', () => {
		renderWithProviders(<ResourcesPage />, {
			auth: {
				user: {
					userId: 1,
					firstName: 'T',
					lastName: 'U',
					email: 't@example.com',
					mobile: '0',
					roles: ['Region Admin'],
					departmentId: 1,
					municipalityId: undefined,
					regionId: 1,
				},
			},
		});

		expect(screen.getByText(/Resource Management/i)).toBeInTheDocument();
		expect(screen.getByText(/No resources available/i)).toBeInTheDocument();
		// back and add buttons should render
		expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Add New Resource/i })).toBeInTheDocument();
	});

	it('renders with department admin role', () => {
		renderWithProviders(<ResourcesPage />, {
			auth: {
				user: {
					userId: 2,
					firstName: 'D',
					lastName: 'Admin',
					email: 'd@example.com',
					mobile: '0',
					roles: ['Department Admin'],
					departmentId: 1,
					municipalityId: undefined,
					regionId: 1,
				},
			},
		});

		expect(screen.getByText(/Resource Management/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Add New Resource/i })).toBeInTheDocument();
	});
});
