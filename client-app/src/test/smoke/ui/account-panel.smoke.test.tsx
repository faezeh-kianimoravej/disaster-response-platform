import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import AccountPanel from '@/components/auth/AccountPanel';
import { renderWithProviders } from '@/test/utils';

describe('AccountPanel smoke', () => {
	it('opens panel and shows user roles', () => {
		renderWithProviders(<AccountPanel />, {
			auth: {
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
			},
		});
		// Open
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		// Shows user roles (read-only)
		expect(screen.getByText(/your roles/i)).toBeInTheDocument();
		expect(screen.getByText(/Region Admin/i)).toBeInTheDocument();
		// Shows logout button
		expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
	});
});
