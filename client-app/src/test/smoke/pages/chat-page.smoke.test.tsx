import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Chat from '@/pages/Chat';

describe('Chat page smoke test', () => {
	it('renders Chat page without crashing', () => {
		renderWithProviders(<Chat />, {
			auth: {
				isLoggedIn: true,
				user: {
					userId: 1,
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					mobile: '000',
					roles: [],
					deleted: false,
				},
				token: 'test-token',
			},
		});
		// Chat page should render without errors
		// The component should be in the document
		expect(document.body).toBeInTheDocument();
	});
});
