import { describe, it, expect, vi } from 'vitest';
import DepartmentsPage from '@/pages/DepartmentsPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/hooks/useDepartment', () => ({
	useDepartments: () => ({ departments: [], loading: false, error: null, refetch: vi.fn() }),
}));

describe('DepartmentsPage (smoke)', () => {
	it('renders heading, empty state and action buttons', () => {
		renderWithProviders(<DepartmentsPage />, {
			auth: {
				user: {
					userId: 1,
					firstName: 'T',
					lastName: 'U',
					email: 't@example.com',
					mobile: '0',
					roles: ['Region Admin'],
					municipalityId: 7,
					departmentId: undefined,
					regionId: 1,
				},
			},
		});

		expect(screen.getByRole('heading', { name: 'Departments' })).toBeInTheDocument();
		expect(screen.getByText(/No departments found/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Add Department/i })).toBeInTheDocument();
	});

	it('renders with municipality admin role', () => {
		renderWithProviders(<DepartmentsPage />, {
			auth: {
				user: {
					userId: 2,
					firstName: 'M',
					lastName: 'Admin',
					email: 'm@example.com',
					mobile: '0',
					roles: ['Municipality Admin'],
					municipalityId: 7,
					departmentId: undefined,
					regionId: 1,
				},
			},
		});

		expect(screen.getByRole('heading', { name: 'Departments' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Add Department/i })).toBeInTheDocument();
	});
});
