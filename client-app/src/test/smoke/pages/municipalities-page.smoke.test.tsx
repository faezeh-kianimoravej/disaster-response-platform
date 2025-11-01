import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import MunicipalitiesPage from '@/pages/MunicipalitiesPage';
import { renderWithProviders } from '@/test/utils';

vi.mock('@/components/auth/AuthGuard', () => ({
	default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useMunicipality', () => ({
	useMunicipalities: () => ({
		municipalities: [],
		loading: false,
		error: null,
		refetch: vi.fn(),
	}),
}));

describe('MunicipalitiesPage (smoke)', () => {
	it('renders heading and empty state', () => {
		renderWithProviders(<MunicipalitiesPage />);

		expect(screen.getByRole('heading', { name: /Municipalities/i })).toBeInTheDocument();
		expect(screen.getByText(/No municipalities found/i)).toBeInTheDocument();
	});
});
