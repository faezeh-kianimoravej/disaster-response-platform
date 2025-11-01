import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import AccountPanel from '@/components/auth/AccountPanel';
import { renderWithProviders } from '@/test/utils';

describe('AccountPanel smoke', () => {
	it('opens panel and shows role controls', () => {
		renderWithProviders(<AccountPanel />);
		// Open
		fireEvent.click(screen.getByRole('button', { name: /account/i }));
		// Updated UI shows headings for current and toggle roles
		expect(screen.getByText(/Current Roles/i)).toBeInTheDocument();
		expect(screen.getByText(/Toggle Roles/i)).toBeInTheDocument();
		// Shows some role checkboxes
		const roleCheckboxes = screen.getAllByRole('checkbox');
		expect(roleCheckboxes.length).toBeGreaterThan(0);
	});
});
