import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import {
	useIncidents,
	useIncident,
	useCreateIncident,
	useUpdateIncident,
	useDeleteIncident,
} from '@/hooks/useIncident';
import type { Incident, IncidentFormData } from '@/types/incident';

vi.mock('@/api/incident', () => ({
	getIncidents: vi.fn(),
	getIncidentById: vi.fn(),
	createIncident: vi.fn(),
	updateIncident: vi.fn(),
	deleteIncident: vi.fn(),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
	});
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	}
	return Wrapper;
}

describe('useIncidents', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches incidents list for a region', async () => {
		const mockIncidents: Incident[] = [
			{
				incidentId: 1,
				reportedBy: 'User 1',
				title: 'Fire',
				description: 'Building fire',
				status: 'Open',
				severity: 'High',
				gripLevel: 3,
				location: 'Downtown',
				latitude: 0,
				longitude: 0,
				reportedAt: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
				regionId: 1,
			},
		];

		const { getIncidents } = await import('@/api/incident');
		vi.mocked(getIncidents).mockResolvedValue(mockIncidents);

		const { result } = renderHook(() => useIncidents(1), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.incidents).toEqual(mockIncidents);
		expect(result.current.error).toBeNull();
		expect(getIncidents).toHaveBeenCalledWith(1);
	});

	it('returns empty array when regionId is undefined', () => {
		const { result } = renderHook(() => useIncidents(undefined), { wrapper: createWrapper() });

		expect(result.current.incidents).toEqual([]);
		expect(result.current.loading).toBe(false);
	});
});

describe('useIncident', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches a single incident by id', async () => {
		const mockIncident: Incident = {
			incidentId: 1,
			reportedBy: 'User 1',
			title: 'Fire',
			description: 'Building fire',
			status: 'Open',
			severity: 'High',
			gripLevel: 3,
			location: 'Downtown',
			latitude: 0,
			longitude: 0,
			reportedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
			regionId: 1,
		};

		const { getIncidentById } = await import('@/api/incident');
		vi.mocked(getIncidentById).mockResolvedValue(mockIncident);

		const { result } = renderHook(() => useIncident(1), { wrapper: createWrapper() });

		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.incident).toEqual(mockIncident);
		expect(result.current.error).toBeNull();
		expect(getIncidentById).toHaveBeenCalledWith(1);
	});

	it('returns null when id is undefined', () => {
		const { result } = renderHook(() => useIncident(undefined), { wrapper: createWrapper() });

		expect(result.current.incident).toBeNull();
		expect(result.current.loading).toBe(false);
	});
});

describe('useCreateIncident', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a new incident', async () => {
		const newIncident: Incident = {
			incidentId: 2,
			reportedBy: 'User 1',
			title: 'Flood',
			description: 'Street flooding',
			status: 'Open',
			severity: 'Medium',
			gripLevel: 2,
			location: 'Main St',
			latitude: 0,
			longitude: 0,
			reportedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
			regionId: 1,
		};

		const { createIncident } = await import('@/api/incident');
		vi.mocked(createIncident).mockResolvedValue(newIncident);

		const { result } = renderHook(() => useCreateIncident(1), { wrapper: createWrapper() });

		const formData: IncidentFormData = {
			incidentId: 0,
			reportedBy: 'User 1',
			title: 'Flood',
			description: 'Street flooding',
			status: 'Open',
			severity: 'Medium',
			gripLevel: 2,
			location: 'Main St',
			latitude: 0,
			longitude: 0,
			reportedAt: new Date(),
			regionId: 1,
		};

		result.current.mutate(formData);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(createIncident).toHaveBeenCalledWith(formData);
	});
});

describe('useUpdateIncident', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates an existing incident', async () => {
		const updatedIncident: Incident = {
			incidentId: 1,
			reportedBy: 'User 1',
			title: 'Fire - Updated',
			description: 'Building fire',
			status: 'In Progress',
			severity: 'High',
			gripLevel: 3,
			location: 'Downtown',
			latitude: 0,
			longitude: 0,
			reportedAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
			regionId: 1,
		};

		const { updateIncident } = await import('@/api/incident');
		vi.mocked(updateIncident).mockResolvedValue(updatedIncident);

		const { result } = renderHook(() => useUpdateIncident(1), { wrapper: createWrapper() });

		result.current.mutate({ id: 1, data: { title: 'Fire - Updated', status: 'In Progress' } });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(updateIncident).toHaveBeenCalledWith(1, {
			title: 'Fire - Updated',
			status: 'In Progress',
		});
	});
});

describe('useDeleteIncident', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('deletes an incident', async () => {
		const { deleteIncident } = await import('@/api/incident');
		vi.mocked(deleteIncident).mockResolvedValue(undefined);

		const { result } = renderHook(() => useDeleteIncident(1), { wrapper: createWrapper() });

		result.current.mutate(1);

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(deleteIncident).toHaveBeenCalledWith(1);
	});
});
