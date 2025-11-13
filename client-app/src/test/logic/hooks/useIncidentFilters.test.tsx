import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIncidentFilters } from '@/hooks/useIncidentFilters';
import type { Incident } from '@/types/incident';

describe('useIncidentFilters', () => {
	const mockIncidents: Incident[] = [
		{
			incidentId: 1,
			reportedBy: 'User 1',
			title: 'Fire Emergency',
			description: 'Building on fire',
			severity: 'HIGH',
			gripLevel: 3,
			status: 'Open',
			reportedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
			location: 'Downtown Plaza',
			latitude: 0,
			longitude: 0,
			regionId: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			incidentId: 2,
			reportedBy: 'User 2',
			title: 'Flood Warning',
			description: 'Street flooding',
			severity: 'MEDIUM',
			gripLevel: 2,
			status: 'In Progress',
			reportedAt: new Date(Date.now() - 40 * 60 * 1000), // 40 minutes ago
			location: 'Main Street',
			latitude: 0,
			longitude: 0,
			regionId: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			incidentId: 3,
			reportedBy: 'User 3',
			title: 'Traffic Accident',
			description: 'Car accident',
			severity: 'LOW',
			gripLevel: 1,
			status: 'Resolved',
			reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
			location: 'Highway 101',
			latitude: 0,
			longitude: 0,
			regionId: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	it('returns all incidents by default', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		expect(result.current.filteredIncidents).toHaveLength(3);
	});

	it('filters by status', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setStatusFilter('Open');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);
		expect(result.current.filteredIncidents[0]?.title).toBe('Fire Emergency');
	});

	it('filters by severity', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setPriorityFilter('HIGH');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);
		expect(result.current.filteredIncidents[0]?.title).toBe('Fire Emergency');
	});

	it('filters by GRIP level', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setGripFilter('2');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);
		expect(result.current.filteredIncidents[0]?.title).toBe('Flood Warning');
	});

	it('filters by time - last 15 minutes', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setTimeFilter('last15');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);
		expect(result.current.filteredIncidents[0]?.title).toBe('Fire Emergency');
	});

	it('filters by time - last 1 hour', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setTimeFilter('last1h');
		});

		expect(result.current.filteredIncidents).toHaveLength(2);
	});

	it('filters by search query matching title', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setSearchQuery('Fire');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);
		expect(result.current.filteredIncidents[0]?.title).toBe('Fire Emergency');
	});

	it('filters by search query matching location', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setSearchQuery('Main Street');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);
		expect(result.current.filteredIncidents[0]?.title).toBe('Flood Warning');
	});

	it('applies multiple filters', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setStatusFilter('Open');
			result.current.setFilters.setPriorityFilter('HIGH');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);
		expect(result.current.filteredIncidents[0]?.title).toBe('Fire Emergency');
	});

	it('clears all filters', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		act(() => {
			result.current.setFilters.setStatusFilter('Open');
			result.current.setFilters.setPriorityFilter('HIGH');
			result.current.setFilters.setSearchQuery('Fire');
		});

		expect(result.current.filteredIncidents).toHaveLength(1);

		act(() => {
			result.current.clearAllFilters();
		});

		expect(result.current.filters.statusFilter).toBe('');
		expect(result.current.filters.priorityFilter).toBe('');
		expect(result.current.filters.searchQuery).toBe('');
		expect(result.current.filteredIncidents).toHaveLength(3);
	});
});
