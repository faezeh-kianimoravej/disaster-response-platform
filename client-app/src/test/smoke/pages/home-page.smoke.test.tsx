import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import HomePage from '@/pages/HomePage';

describe('HomePage (smoke)', () => {
	it('renders welcome message and login button for logged out users', () => {
		renderWithProviders(<HomePage />, {
			auth: { isLoggedIn: false, user: null, token: undefined },
		});
		expect(screen.getByText(/welcome to/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
	});

	it('renders personalized message for logged in users', () => {
		renderWithProviders(<HomePage />, {
			auth: {
				isLoggedIn: true,
				user: {
					userId: 1,
					firstName: 'John',
					lastName: 'Doe',
					email: 'john@example.com',
					mobile: '000',
					roles: [],
					deleted: false,
				},
				token: 'test-token',
			},
		});
		expect(screen.getByText(/welcome back, john doe/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /go to your dashboard/i })).toBeInTheDocument();
	});

	it('uses email when firstName is empty', () => {
		renderWithProviders(<HomePage />, {
			auth: {
				isLoggedIn: true,
				user: {
					userId: 1,
					firstName: '',
					lastName: '',
					email: 'test@example.com',
					mobile: '000',
					roles: [],
					deleted: false,
				},
				token: 'test-token',
			},
		});
		expect(screen.getByText(/welcome back, test@example\.com/i)).toBeInTheDocument();
	});
});
