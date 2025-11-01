import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import AccountPanel from '@/components/auth/AccountPanel';
import { renderWithProviders } from '@/test/utils';

describe('AccountPanel smoke', () => {
	it('opens panel and shows role controls', () => {
		renderWithProviders(<AccountPanel />);
		// Open
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		expect(screen.getByText(/manage authentication/i)).toBeInTheDocument();
		// Shows role list heading and a checkbox
		expect(screen.getByText(/roles/i)).toBeInTheDocument();
		const roleCheckboxes = screen.getAllByRole('checkbox');
		expect(roleCheckboxes.length).toBeGreaterThan(0);
	});
});
