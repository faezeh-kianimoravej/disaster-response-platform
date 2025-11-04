import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IncidentPriorityForm from '@/components/forms/IncidentPriorityForm';
import type { Incident } from '@/types/incident';
import { renderWithProviders } from '@/test/utils';

// Mock useUpdateIncident hook
const mockUpdate = {
	// Keep typing simple for build: we don't need generics here
	mutateAsync: vi.fn(),
	isPending: false,
};

vi.mock('@/hooks/useIncident', () => ({
	useUpdateIncident: () => mockUpdate,
}));

const makeIncident = (overrides: Partial<Incident> = {}): Incident => ({
	incidentId: 1,
	reportedBy: 'user@example.com',
	title: 'Test Incident',
	description: 'Test description',
	severity: 'Medium',
	gripLevel: 2,
	status: 'Open',
	reportedAt: new Date('2025-01-01'),
	location: 'Test Location',
	latitude: 51.5,
	longitude: -0.1,
	regionId: 10,
	createdAt: new Date('2025-01-01'),
	updatedAt: new Date('2025-01-01'),
	...overrides,
});

describe('IncidentPriorityForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUpdate.isPending = false;
	});

	it('renders with initial severity and GRIP level from incident', () => {
		const incident = makeIncident({ severity: 'High', gripLevel: 4 });
		renderWithProviders(<IncidentPriorityForm incident={incident} />);

		const severitySelect = screen.getByLabelText(/severity/i) as HTMLSelectElement;
		const gripSelect = screen.getByLabelText(/grip level/i) as HTMLSelectElement;

		expect(severitySelect.value).toBe('High');
		expect(gripSelect.value).toBe('4');
	});

	it('submits successfully and calls onSuccess with toast', async () => {
		const incident = makeIncident();
		const onSuccess = vi.fn();
		const updated = makeIncident({ severity: 'Critical', gripLevel: 5 });

		mockUpdate.mutateAsync.mockResolvedValueOnce(updated);

		renderWithProviders(<IncidentPriorityForm incident={incident} onSuccess={onSuccess} />);

		// Change severity and GRIP level
		await userEvent.selectOptions(screen.getByLabelText(/severity/i), 'Critical');
		await userEvent.selectOptions(screen.getByLabelText(/grip level/i), '5');

		// Submit
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		await waitFor(() => {
			expect(mockUpdate.mutateAsync).toHaveBeenCalledWith({
				id: 1,
				data: {
					...incident,
					severity: 'Critical',
					gripLevel: 5,
				},
			});
		});

		expect(onSuccess).toHaveBeenCalled();
		// Toast success message should appear
		expect(await screen.findByText(/Incident updated/i)).toBeInTheDocument();
	});

	it('calls onFailure when mutation fails', async () => {
		const incident = makeIncident();
		const onFailure = vi.fn();
		const error = new Error('Update failed');

		mockUpdate.mutateAsync.mockRejectedValueOnce(error);

		renderWithProviders(<IncidentPriorityForm incident={incident} onFailure={onFailure} />);

		await userEvent.selectOptions(screen.getByLabelText(/severity/i), 'Low');
		await userEvent.click(screen.getByRole('button', { name: /save/i }));

		await waitFor(() => {
			expect(mockUpdate.mutateAsync).toHaveBeenCalled();
		});

		expect(onFailure).toHaveBeenCalledWith(error);
	});

	it('calls onCancel when cancel button is clicked', async () => {
		const incident = makeIncident();
		const onCancel = vi.fn();

		renderWithProviders(<IncidentPriorityForm incident={incident} onCancel={onCancel} />);

		await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

		expect(onCancel).toHaveBeenCalled();
	});

	it('disables submit button when mutation is pending', () => {
		const incident = makeIncident();
		mockUpdate.isPending = true;

		renderWithProviders(<IncidentPriorityForm incident={incident} />);

		const saveButton = screen.getByRole('button', { name: /save/i });
		expect(saveButton).toBeDisabled();
	});

	it('renders all severity options', () => {
		const incident = makeIncident();
		renderWithProviders(<IncidentPriorityForm incident={incident} />);

		const severitySelect = screen.getByLabelText(/severity/i) as HTMLSelectElement;
		const options = Array.from(severitySelect.options).map(opt => opt.value);

		expect(options).toEqual(['Low', 'Medium', 'High', 'Critical']);
	});

	it('renders GRIP level options 0-5', () => {
		const incident = makeIncident();
		renderWithProviders(<IncidentPriorityForm incident={incident} />);

		const gripSelect = screen.getByLabelText(/grip level/i) as HTMLSelectElement;
		const options = Array.from(gripSelect.options).map(opt => opt.value);

		expect(options).toEqual(['0', '1', '2', '3', '4', '5']);
	});
});
