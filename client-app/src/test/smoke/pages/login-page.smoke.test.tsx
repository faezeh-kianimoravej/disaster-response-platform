import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import LoginPage from '@/pages/LoginPage';

describe('LoginPage (smoke)', () => {
	it('renders login form fields and submit button', () => {
		renderWithProviders(<LoginPage />);
		expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
	});
});
