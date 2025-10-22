import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useIncidentFilters } from '../hooks/useIncidentFilters';
import type { Incident } from '../types/incident';

describe('useIncidentFilters hook', () => {
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
			reportedAt: new Date('2025-10-17T10:00:00'),
		}),
		createMockIncident({
			incidentId: 2,
			title: 'Medical emergency',
			severity: 'Critical',
			status: 'In Progress',
			gripLevel: 2,
			location: 'Rotterdam',
			reportedAt: new Date('2025-10-17T09:30:00'),
		}),
		createMockIncident({
			incidentId: 3,
			title: 'Traffic accident',
			severity: 'Medium',
			status: 'Resolved',
			gripLevel: 1,
			location: 'Utrecht',
			reportedAt: new Date('2025-10-17T08:00:00'),
		}),
		createMockIncident({
			incidentId: 4,
			title: 'Gas leak',
			severity: 'High',
			status: 'Closed',
			gripLevel: 2,
			location: 'The Hague',
			reportedAt: new Date('2025-10-16T15:00:00'),
		}),
	];

	it('should initialize with empty filters', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		expect(result.current.filters.statusFilter).toBe('');
		expect(result.current.filters.priorityFilter).toBe('');
		expect(result.current.filters.gripFilter).toBe('');
		expect(result.current.filters.timeFilter).toBe('');
		expect(result.current.filters.searchQuery).toBe('');
	});

	it('should return all incidents when no filters are applied', () => {
		const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

		expect(result.current.filteredIncidents).toHaveLength(4);
		expect(result.current.filteredIncidents).toEqual(mockIncidents);
	});

	describe('status filter', () => {
		it('should filter incidents by status', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setStatusFilter('Open');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.status).toBe('Open');
		});

		it('should handle multiple statuses correctly', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setStatusFilter('In Progress');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.incidentId).toBe(2);
		});
	});

	describe('priority (severity) filter', () => {
		it('should filter incidents by priority', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setPriorityFilter('High');
			});

			expect(result.current.filteredIncidents).toHaveLength(2);
			expect(result.current.filteredIncidents.every(i => i.severity === 'High')).toBe(true);
		});

		it('should filter for Critical priority', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setPriorityFilter('Critical');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.severity).toBe('Critical');
		});
	});

	describe('GRIP level filter', () => {
		it('should filter incidents by GRIP level', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setGripFilter('2');
			});

			expect(result.current.filteredIncidents).toHaveLength(2);
			expect(result.current.filteredIncidents.every(i => i.gripLevel === 2)).toBe(true);
		});

		it('should handle GRIP level as string', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setGripFilter('3');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.gripLevel).toBe(3);
		});
	});

	describe('search query filter', () => {
		it('should filter incidents by title', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setSearchQuery('fire');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.title).toContain('Fire');
		});

		it('should filter incidents by location', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setSearchQuery('rotterdam');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.location).toBe('Rotterdam');
		});

		it('should be case insensitive', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setSearchQuery('AMSTERDAM');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.location).toBe('Amsterdam');
		});

		it('should filter by description', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setSearchQuery('description');
			});

			expect(result.current.filteredIncidents).toHaveLength(4);
		});
	});

	describe('time filter', () => {
		beforeEach(() => {
			// Mock the current date to 2025-10-17T10:15:00
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2025-10-17T10:15:00'));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should filter incidents from last 15 minutes', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setTimeFilter('last15');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.incidentId).toBe(1);
		});

		it('should filter incidents from last 30 minutes', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setTimeFilter('last30');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
		});

		it('should filter incidents from last 1 hour', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setTimeFilter('last1h');
			});

			expect(result.current.filteredIncidents).toHaveLength(2);
		});

		it('should filter incidents from last 3 hours', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setTimeFilter('last3h');
			});

			expect(result.current.filteredIncidents).toHaveLength(3);
		});

		it('should filter incidents from today', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setTimeFilter('today');
			});

			expect(result.current.filteredIncidents).toHaveLength(3);
		});
	});

	describe('combined filters', () => {
		it('should apply multiple filters together', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setStatusFilter('Open');
				result.current.setFilters.setPriorityFilter('High');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.incidentId).toBe(1);
		});

		it('should return empty array when no incidents match all filters', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setStatusFilter('Closed');
				result.current.setFilters.setPriorityFilter('Critical');
			});

			expect(result.current.filteredIncidents).toHaveLength(0);
		});

		it('should combine search with other filters', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setSearchQuery('fire');
				result.current.setFilters.setGripFilter('3');
			});

			expect(result.current.filteredIncidents).toHaveLength(1);
			expect(result.current.filteredIncidents[0]?.title).toContain('Fire');
		});
	});

	describe('clearAllFilters', () => {
		it('should clear all filters', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setStatusFilter('Open');
				result.current.setFilters.setPriorityFilter('High');
				result.current.setFilters.setGripFilter('2');
				result.current.setFilters.setSearchQuery('fire');
				result.current.setFilters.setTimeFilter('last1h');
			});

			expect(result.current.filters.statusFilter).toBe('Open');
			expect(result.current.filteredIncidents).toHaveLength(0);

			act(() => {
				result.current.clearAllFilters();
			});

			expect(result.current.filters.statusFilter).toBe('');
			expect(result.current.filters.priorityFilter).toBe('');
			expect(result.current.filters.gripFilter).toBe('');
			expect(result.current.filters.timeFilter).toBe('');
			expect(result.current.filters.searchQuery).toBe('');
			expect(result.current.filteredIncidents).toHaveLength(4);
		});

		it('should reset to all incidents after clearing filters', () => {
			const { result } = renderHook(() => useIncidentFilters({ incidents: mockIncidents }));

			act(() => {
				result.current.setFilters.setStatusFilter('Closed');
				result.current.clearAllFilters();
			});

			expect(result.current.filteredIncidents).toEqual(mockIncidents);
		});
	});
});
