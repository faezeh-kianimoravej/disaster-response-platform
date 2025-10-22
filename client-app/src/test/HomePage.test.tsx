import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from '../pages/HomePage';
import { getIncidents } from '../api/incident';
import type { Incident } from '../types/incident';

// Mock the API
vi.mock('../api/incident', () => ({
	getIncidents: vi.fn(),
}));

describe('HomePage component', () => {
	const createMockIncident = (overrides?: Partial<Incident>): Incident => ({
		incidentId: 1,
		reportedBy: 'Test Department',
		title: 'Test Incident',
		description: 'Test Description',
		severity: 'High',
		gripLevel: 2,
		status: 'Open',
		reportedAt: new Date('2025-10-17T10:00:00'),
		location: 'Amsterdam',
		latitude: 52.3676,
		longitude: 4.9041,
		createdAt: new Date('2025-10-17T10:00:00'),
		updatedAt: new Date('2025-10-17T10:00:00'),
		...overrides,
	});

	const mockIncidents: Incident[] = [
		createMockIncident({
			incidentId: 1,
			title: 'Fire in building',
			severity: 'High',
			status: 'Open',
			gripLevel: 3,
			location: 'Amsterdam',
		}),
		createMockIncident({
			incidentId: 2,
			title: 'Medical emergency',
			severity: 'Critical',
			status: 'In Progress',
			gripLevel: 2,
			location: 'Rotterdam',
		}),
		createMockIncident({
			incidentId: 3,
			title: 'Traffic accident',
			severity: 'Medium',
			status: 'Resolved',
			gripLevel: 1,
			location: 'Utrecht',
		}),
	];

	beforeEach(() => {
		vi.clearAllMocks();
		(getIncidents as ReturnType<typeof vi.fn>).mockResolvedValue(mockIncidents);
	});

	describe('ordering and grouping', () => {
		it('should not display Closed incidents even if returned by API', async () => {
			(getIncidents as ReturnType<typeof vi.fn>).mockResolvedValue([
				createMockIncident({
					incidentId: 10,
					title: 'Closed case',
					status: 'Closed',
					severity: 'Critical',
				}),
				createMockIncident({
					incidentId: 11,
					title: 'Open case',
					status: 'Open',
					severity: 'Low',
				}),
				createMockIncident({
					incidentId: 12,
					title: 'Resolved case',
					status: 'Resolved',
					severity: 'Medium',
				}),
			]);

			render(<HomePage />);

			await waitFor(() => {
				expect(screen.queryByText('Closed case')).not.toBeInTheDocument();
				expect(screen.getByText('Open case')).toBeInTheDocument();
				expect(screen.getByText('Resolved case')).toBeInTheDocument();
			});
		});

		it('orders incidents: Open first (separator), then In Progress, then Resolved', async () => {
			(getIncidents as ReturnType<typeof vi.fn>).mockResolvedValue([
				createMockIncident({
					incidentId: 21,
					title: 'Open Critical',
					status: 'Open',
					severity: 'Critical',
				}),
				createMockIncident({
					incidentId: 22,
					title: 'InProg Critical',
					status: 'In Progress',
					severity: 'Critical',
				}),
				createMockIncident({
					incidentId: 23,
					title: 'Resolved Low',
					status: 'Resolved',
					severity: 'Low',
				}),
				createMockIncident({
					incidentId: 24,
					title: 'Open Low',
					status: 'Open',
					severity: 'Low',
				}),
			]);

			render(<HomePage />);

			await waitFor(() => {
				// Expect a separator <hr /> to exist between Open and others
				expect(document.querySelector('hr')).toBeInTheDocument();
			});

			const headings = await screen.findAllByRole('heading', { level: 3 });
			const titles = headings.map(h => h.textContent?.trim() ?? '');

			// Open group should come first in severity order (Critical then Low)
			expect(titles.indexOf('Open Critical')).toBeLessThan(titles.indexOf('Open Low'));
			// Both open titles should come before the non-open ones
			expect(titles.indexOf('Open Low')).toBeLessThan(titles.indexOf('InProg Critical'));
			// In Progress should come before Resolved
			expect(titles.indexOf('InProg Critical')).toBeLessThan(titles.indexOf('Resolved Low'));
		});

		it('sorts by severity within the same status group', async () => {
			(getIncidents as ReturnType<typeof vi.fn>).mockResolvedValue([
				createMockIncident({
					incidentId: 31,
					title: 'Open Low',
					status: 'Open',
					severity: 'Low',
				}),
				createMockIncident({
					incidentId: 32,
					title: 'Open High',
					status: 'Open',
					severity: 'High',
				}),
				createMockIncident({
					incidentId: 33,
					title: 'Open Medium',
					status: 'Open',
					severity: 'Medium',
				}),
				createMockIncident({
					incidentId: 34,
					title: 'Open Critical',
					status: 'Open',
					severity: 'Critical',
				}),
			]);

			render(<HomePage />);

			const headings = await screen.findAllByRole('heading', { level: 3 });
			const titles = headings.map(h => h.textContent?.trim() ?? '');

			// Expect order: Critical > High > Medium > Low
			const order = ['Open Critical', 'Open High', 'Open Medium', 'Open Low'];
			for (let i = 0; i < order.length - 1; i++) {
				const current = order[i] as string;
				const next = order[i + 1] as string;
				expect(titles.indexOf(current)).toBeLessThan(titles.indexOf(next));
			}
		});

		describe('section headers', () => {
			it('renders small section headers for present groups', async () => {
				(getIncidents as ReturnType<typeof vi.fn>).mockResolvedValue([
					createMockIncident({
						incidentId: 41,
						title: 'Open Item',
						status: 'Open',
						severity: 'High',
					}),
					createMockIncident({
						incidentId: 42,
						title: 'In Progress Item',
						status: 'In Progress',
						severity: 'Medium',
					}),
					createMockIncident({
						incidentId: 43,
						title: 'Resolved Item',
						status: 'Resolved',
						severity: 'Low',
					}),
				]);

				render(<HomePage />);

				// assert section headers by role level=2
				const h2s = await screen.findAllByRole('heading', { level: 2 });
				const headerTexts = h2s.map(h => h.textContent?.trim() ?? '');
				expect(headerTexts).toContain('Open');
				expect(headerTexts).toContain('In Progress');
				expect(headerTexts).toContain('Resolved');
			});
		});
	});

	describe('rendering', () => {
		it('should show loading state initially', () => {
			render(<HomePage />);

			expect(screen.getByText('Loading incidents...')).toBeInTheDocument();
		});

		it('should render page title', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.queryByText('Loading incidents...')).not.toBeInTheDocument();
				expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
			});
		});

		it('should render all incidents after loading', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
				expect(screen.getByText('Medical emergency')).toBeInTheDocument();
				expect(screen.getByText('Traffic accident')).toBeInTheDocument();
			});
		});

		it('should render filter component', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
			});
		});
	});

	describe('data fetching', () => {
		it('should call getIncidents on mount', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(getIncidents).toHaveBeenCalledTimes(1);
			});
		});

		it('should handle empty incidents list', async () => {
			(getIncidents as ReturnType<typeof vi.fn>).mockResolvedValue([]);

			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('No incidents found matching your filters.')).toBeInTheDocument();
			});
		});

		it('should handle API errors gracefully', async () => {
			const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
			(getIncidents as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to fetch'));

			render(<HomePage />);

			await waitFor(() => {
				expect(consoleError).toHaveBeenCalledWith('Failed to load incidents:', expect.any(Error));
			});

			consoleError.mockRestore();
		});
	});

	describe('filtering', () => {
		it('should filter incidents by status', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
			fireEvent.change(statusSelect, { target: { value: 'Open' } });

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
				expect(screen.queryByText('Medical emergency')).not.toBeInTheDocument();
				expect(screen.queryByText('Traffic accident')).not.toBeInTheDocument();
			});
		});

		it('should filter incidents by priority', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Medical emergency')).toBeInTheDocument();
			});

			const prioritySelect = document.querySelector('select[name="priority"]') as HTMLSelectElement;
			fireEvent.change(prioritySelect, { target: { value: 'Critical' } });

			await waitFor(() => {
				expect(screen.getByText('Medical emergency')).toBeInTheDocument();
				expect(screen.queryByText('Fire in building')).not.toBeInTheDocument();
				expect(screen.queryByText('Traffic accident')).not.toBeInTheDocument();
			});
		});

		it('should filter incidents by GRIP level', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			const gripSelect = document.querySelector('select[name="grip"]') as HTMLSelectElement;
			fireEvent.change(gripSelect, { target: { value: '3' } });

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
				expect(screen.queryByText('Medical emergency')).not.toBeInTheDocument();
				expect(screen.queryByText('Traffic accident')).not.toBeInTheDocument();
			});
		});

		it('should filter incidents by search query', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			const searchInput = screen.getByPlaceholderText('Search');
			fireEvent.change(searchInput, { target: { value: 'fire' } });

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
				expect(screen.queryByText('Medical emergency')).not.toBeInTheDocument();
				expect(screen.queryByText('Traffic accident')).not.toBeInTheDocument();
			});
		});

		it('should show no results message when filters match nothing', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			// Choose a GRIP level not present in mock incidents to yield zero results
			const gripSelect = document.querySelector('select[name="grip"]') as HTMLSelectElement;
			fireEvent.change(gripSelect, { target: { value: '5' } });

			await waitFor(() => {
				expect(screen.getByText('No incidents found matching your filters.')).toBeInTheDocument();
			});
		});
	});

	describe('filter pills', () => {
		it('should show active filter pills when filters are applied', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
			fireEvent.change(statusSelect, { target: { value: 'Open' } });

			await waitFor(() => {
				expect(screen.getByText('Active filters:')).toBeInTheDocument();
				expect(screen.getByText(/Status: Open/)).toBeInTheDocument();
			});
		});

		it('should remove individual filters when pill X is clicked', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
			fireEvent.change(statusSelect, { target: { value: 'Open' } });

			await waitFor(() => {
				expect(screen.getByText(/Status: Open/)).toBeInTheDocument();
			});

			const removeButton = screen.getByLabelText('Remove status filter');
			fireEvent.click(removeButton);

			await waitFor(() => {
				expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
				expect(screen.getByText('Medical emergency')).toBeInTheDocument();
				expect(screen.getByText('Traffic accident')).toBeInTheDocument();
			});
		});

		it('should clear all filters when Clear All Filters button is clicked', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			// Apply multiple filters
			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
			const prioritySelect = document.querySelector('select[name="priority"]') as HTMLSelectElement;

			fireEvent.change(statusSelect, { target: { value: 'Open' } });
			fireEvent.change(prioritySelect, { target: { value: 'High' } });

			await waitFor(() => {
				expect(screen.getByText('Active filters:')).toBeInTheDocument();
			});

			const clearButton = screen.getByText('Clear All Filters');
			fireEvent.click(clearButton);

			await waitFor(() => {
				expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
				expect(screen.getByText('Medical emergency')).toBeInTheDocument();
				expect(screen.getByText('Traffic accident')).toBeInTheDocument();
			});
		});
	});

	describe('incident interactions', () => {
		it('should log to console when Details button is clicked', async () => {
			const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			// Find the first Details button
			const detailsButtons = screen.getAllByText('Details');
			if (detailsButtons[0]) {
				fireEvent.click(detailsButtons[0]);
			}

			expect(consoleLog).toHaveBeenCalledWith('Details clicked for incident:', expect.any(Number));

			consoleLog.mockRestore();
		});

		it('should log to console when Chat button is clicked', async () => {
			const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			// Find the first Chat button
			const chatButtons = screen.getAllByText('Chat');
			if (chatButtons[0]) {
				fireEvent.click(chatButtons[0]);
			}

			expect(consoleLog).toHaveBeenCalledWith('Chat clicked for incident:', expect.any(Number));

			consoleLog.mockRestore();
		});
	});

	describe('active filter styling', () => {
		it('should apply blue border to active filter inputs', async () => {
			render(<HomePage />);

			await waitFor(() => {
				expect(screen.getByText('Fire in building')).toBeInTheDocument();
			});

			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;

			// Initially should not have blue border
			expect(statusSelect).not.toHaveClass('border-blue-500');

			fireEvent.change(statusSelect, { target: { value: 'Open' } });

			await waitFor(() => {
				expect(statusSelect).toHaveClass('border-blue-500');
			});
		});
	});
});
