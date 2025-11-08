import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import LoginPage from '@/pages/LoginPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('LoginPage', () => {
	it('redirects logged-in users to their default landing page', () => {
		renderWithProviders(<LoginPage />, {
			auth: {
				isLoggedIn: true,
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [
						{
							roleType: 'Region Admin',
							regionId: 1,
							municipalityId: null,
							departmentId: null,
						},
					],
					deleted: false,
				},
				token: 'test-token',
			},
		});

		// Should redirect immediately, so login form might not even render
		// At minimum, navigate should have been called
		expect(mockNavigate).toHaveBeenCalled();
	});

	it('shows login form for logged out users', () => {
		renderWithProviders(<LoginPage />, {
			auth: { isLoggedIn: false, user: null, token: undefined },
		});

		expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
	});
});
