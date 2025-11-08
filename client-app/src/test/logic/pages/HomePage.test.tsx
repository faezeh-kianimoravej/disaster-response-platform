import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import HomePage from '@/pages/HomePage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('HomePage', () => {
	it('navigates to login when sign in button is clicked', () => {
		renderWithProviders(<HomePage />, {
			auth: { isLoggedIn: false, user: null, token: undefined },
		});

		const signInBtn = screen.getByRole('button', { name: /sign in/i });
		fireEvent.click(signInBtn);

		expect(mockNavigate).toHaveBeenCalledWith('/login');
	});

	it('navigates to appropriate dashboard based on user role', () => {
		renderWithProviders(<HomePage />, {
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

		const dashboardBtn = screen.getByRole('button', { name: /go to your dashboard/i });
		fireEvent.click(dashboardBtn);

		expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
	});

	it('navigates to departments for municipality admin', () => {
		renderWithProviders(<HomePage />, {
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
							roleType: 'Municipality Admin',
							regionId: null,
							municipalityId: 1,
							departmentId: null,
						},
					],
					deleted: false,
				},
				token: 'test-token',
			},
		});

		const dashboardBtn = screen.getByRole('button', { name: /go to your dashboard/i });
		fireEvent.click(dashboardBtn);

		expect(mockNavigate).toHaveBeenCalledWith('/departments');
	});

	it('navigates to resources for department admin', () => {
		renderWithProviders(<HomePage />, {
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
							roleType: 'Department Admin',
							regionId: null,
							municipalityId: null,
							departmentId: 1,
						},
					],
					deleted: false,
				},
				token: 'test-token',
			},
		});

		const dashboardBtn = screen.getByRole('button', { name: /go to your dashboard/i });
		fireEvent.click(dashboardBtn);

		expect(mockNavigate).toHaveBeenCalledWith('/resources');
	});
});
