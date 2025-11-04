import { describe, it, expect } from 'vitest';
import NotAuthorizedPage from '@/pages/NotAuthorizedPage';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

describe('NotAuthorizedPage (smoke)', () => {
	it('renders heading and home link', () => {
		renderWithProviders(<NotAuthorizedPage />);
		expect(screen.getByText(/Not Authorized/i)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /Go to Home/i })).toBeInTheDocument();
	});
});
