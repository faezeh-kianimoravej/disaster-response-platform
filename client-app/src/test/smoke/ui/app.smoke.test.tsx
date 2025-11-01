import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';

describe('App smoke', () => {
	it('mounts and shows navigation', () => {
		const client = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		});
		render(
			<QueryClientProvider client={client}>
				<App />
			</QueryClientProvider>
		);
		// Brand/logo in nav
		expect(screen.getByRole('link', { name: /drccs/i })).toBeInTheDocument();
	});
});
