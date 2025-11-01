import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import IncidentCard from '@/components/features/incidents/IncidentCard';
import type { Incident } from '@/types/incident';

function makeIncident(overrides: Partial<Incident> = {}): Incident {
	const base: Incident = {
		incidentId: 42,
		reportedBy: 'Tester',
		title: 'Warehouse Fire',
		description: 'A fire broke out in the warehouse',
		severity: 'High',
		gripLevel: 2,
		status: 'Open',
		reportedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
		location: 'Dock District',
		latitude: 0,
		longitude: 0,
		regionId: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	return { ...base, ...overrides };
}

function renderWithRouter(ui: React.ReactElement) {
	return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('IncidentCard', () => {
	it('renders title as link, badges, and meta info', () => {
		const incident = makeIncident();
		renderWithRouter(<IncidentCard incident={incident} />);

		// Title link
		const link = screen.getByRole('link', { name: incident.title });
		expect(link).toHaveAttribute('href', `/incidents/${incident.incidentId}`);

		// Priority badge text and color (High -> orange classes)
		const priority = screen.getByText(/Priority:\s*High/i);
		expect(priority).toBeInTheDocument();
		expect(priority.className).toContain('bg-orange-100');

		// GRIP badge
		screen.getByText(/GRIP:\s*2/i);

		// Location • Status • time
		const meta = screen.getByText(/Dock District/i);
		expect(meta.textContent).toMatch(/Open/);
		expect(meta.textContent).toMatch(/ago/); // 10m ago
	});

	it('maps Critical -> red and Low -> green badge variants', () => {
		const critical = makeIncident({ severity: 'Critical' });
		const low = makeIncident({ severity: 'Low', title: 'Minor Incident' });

		renderWithRouter(
			<>
				<IncidentCard incident={critical} />
				<IncidentCard incident={low} />
			</>
		);

		expect(screen.getByText(/Priority:\s*Critical/i).className).toContain('bg-red-100');
		expect(screen.getByText(/Priority:\s*Low/i).className).toContain('bg-green-100');
	});

	it('fires callbacks for Details and Chat buttons', async () => {
		// Using direct userEvent API for this project version
		const onDetailsClick = vi.fn();
		const onChatClick = vi.fn();
		const incident = makeIncident();

		renderWithRouter(
			<IncidentCard incident={incident} onDetailsClick={onDetailsClick} onChatClick={onChatClick} />
		);

		await userEvent.click(screen.getByRole('button', { name: /details/i }));
		expect(onDetailsClick).toHaveBeenCalledWith(incident);

		await userEvent.click(screen.getByRole('button', { name: /chat/i }));
		expect(onChatClick).toHaveBeenCalledWith(incident);
	});

	it('shows time as hours ago when reported ~2 hours ago', () => {
		const incident = makeIncident({ reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) });
		renderWithRouter(<IncidentCard incident={incident} />);
		const meta = screen.getByText(/Dock District/i);
		expect(meta.textContent).toMatch(/h ago/);
	});

	it('shows Yesterday for incidents from yesterday', () => {
		const now = new Date();
		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(12, 0, 0, 0);
		const incident = makeIncident({ reportedAt: yesterday });
		renderWithRouter(<IncidentCard incident={incident} />);
		const meta = screen.getByText(/Dock District/i);
		expect(meta.textContent).toMatch(/Yesterday/);
	});

	it('shows full date when older than a week (no "ago" or "Yesterday")', () => {
		const incident = makeIncident({ reportedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) });
		renderWithRouter(<IncidentCard incident={incident} />);
		const meta = screen.getByText(/Dock District/i);
		expect(meta.textContent).not.toMatch(/ago/);
		expect(meta.textContent).not.toMatch(/Yesterday/);
	});
});
