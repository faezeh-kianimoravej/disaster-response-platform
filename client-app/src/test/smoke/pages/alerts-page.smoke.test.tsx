import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AlertsPage from '@/pages/AlertsPage';

describe('AlertsPage (smoke)', () => {
	it('renders heading and static alert content', () => {
		render(<AlertsPage />);

		expect(screen.getByRole('heading', { name: /Emergency Alerts/i })).toBeInTheDocument();
		expect(screen.getByText(/Real-time emergency notifications/i)).toBeInTheDocument();
		expect(screen.getByText(/Critical Alert/i)).toBeInTheDocument();
		expect(screen.getByText(/Severe weather warning/i)).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Warning' })).toBeInTheDocument();
		expect(screen.getByText(/Road closures due to flooding/i)).toBeInTheDocument();
	});
});
