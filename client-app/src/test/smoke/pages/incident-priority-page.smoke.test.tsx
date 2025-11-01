import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import IncidentPriorityPage from '@/pages/IncidentPriorityPage';
import { renderWithProviders } from '@/test/utils';

vi.mock('@/components/auth/AuthGuard', () => ({
	default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useIncident', () => ({
	useIncident: () => ({
		incident: null,
		loading: false,
		error: null,
		fetchIncident: vi.fn(),
	}),
}));

describe('IncidentPriorityPage (smoke)', () => {
	it('renders heading and not found message when no incident', () => {
		renderWithProviders(<IncidentPriorityPage />);

		expect(screen.getByRole('heading', { name: /Prioritize Incident/i })).toBeInTheDocument();
		expect(screen.getByText(/Incident not found/i)).toBeInTheDocument();
	});
});
