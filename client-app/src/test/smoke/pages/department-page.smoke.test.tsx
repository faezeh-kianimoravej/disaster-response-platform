import { describe, it, expect, vi } from 'vitest';
import DepartmentPage from '@/pages/DepartmentPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

vi.mock('@/components/auth/AuthGuard', () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Hook mocks configurable per-test
const mockUseDepartment = vi.fn();
const mockUseDeleteDepartment = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockUseCreateDepartment = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });
const mockUseUpdateDepartment = vi.fn().mockReturnValue({ mutateAsync: vi.fn() });

vi.mock('@/hooks/useDepartment', () => ({
	useDepartment: (...args: unknown[]) => mockUseDepartment(...args),
	useDeleteDepartment: (...args: unknown[]) => mockUseDeleteDepartment(...args),
	useCreateDepartment: (...args: unknown[]) => mockUseCreateDepartment(...args),
	useUpdateDepartment: (...args: unknown[]) => mockUseUpdateDepartment(...args),
}));

describe('DepartmentPage (smoke)', () => {
	it('renders create form when no departmentId (new)', () => {
		mockUseDepartment.mockReturnValue({
			department: undefined,
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<DepartmentPage />);
		expect(screen.getByRole('heading', { name: /Create New Department/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/Department Name/i)).toBeInTheDocument();
	});

	it('renders view when existing department loaded', () => {
		mockUseDepartment.mockReturnValue({
			department: {
				departmentId: 1,
				name: 'Fire Dept',
				image: '',
				municipalityId: 7,
			},
			loading: false,
			error: null,
			refetch: vi.fn(),
		});

		renderWithProviders(<DepartmentPage />, {
			route: '/department/1',
			routePath: '/department/:departmentId',
		});
		expect(screen.getByText('Fire Dept')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
	});
});
