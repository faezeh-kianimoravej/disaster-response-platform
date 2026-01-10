import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/utils';
import {
	useAssignResponseUnit,
	useAssignFillUnit,
	useIncidentForResponder,
} from '@/hooks/useDeployment';
import React, { type ReactNode } from 'react';

// Mock the API module
vi.mock('@/api/deployment/deployment', () => ({
	assignResponseUnitToDeploymentRequest: vi.fn(),
	assignFillUnitToDeploymentRequest: vi.fn(),
}));

// Mock the main deployment API
vi.mock('@/api/deployment', () => ({
	getIncidentForResponder: vi.fn(),
}));

const deploymentApi = await import('@/api/deployment/deployment');
const mockedApi = vi.mocked(deploymentApi, { partial: true });

const mainDeploymentApi = await import('@/api/deployment');
const mockedDeploymentApi = vi.mocked(mainDeploymentApi, { partial: true });

describe('useDeployment hooks', () => {
	let queryClient: QueryClient;

	const createWrapper = () => {
		// eslint-disable-next-line react/display-name
		return ({ children }: { children: ReactNode }) =>
			React.createElement(QueryClientProvider, { client: queryClient }, children);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient = createTestQueryClient();
	});

	describe('useAssignResponseUnit', () => {
		const mockAssignmentResponse = {
			success: true,
			assignedUnitId: 500,
			message: 'ResponseUnit assignment successful',
		};

		it('should assign response unit successfully', async () => {
			mockedApi.assignResponseUnitToDeploymentRequest.mockResolvedValue(mockAssignmentResponse);

			const { result } = renderHook(() => useAssignResponseUnit(), {
				wrapper: createWrapper(),
			});

			const assignmentData = {
				requestId: 1,
				assignedBy: 300,
				assignedUnitId: 500,
				notes: 'Test ResponseUnit assignment',
			};

			await result.current.mutateAsync(assignmentData);

			expect(mockedApi.assignResponseUnitToDeploymentRequest).toHaveBeenCalledTimes(1);
			// Check that the first argument matches our assignment data
			const callArgs = mockedApi.assignResponseUnitToDeploymentRequest.mock.calls[0];
			expect(callArgs).toBeDefined();
			expect(callArgs![0]).toEqual(assignmentData);
		});

		it('should invalidate queries on successful assignment', async () => {
			mockedApi.assignResponseUnitToDeploymentRequest.mockResolvedValue(mockAssignmentResponse);

			// Pre-populate cache with some data
			queryClient.setQueryData(['deploymentRequests'], []);
			queryClient.setQueryData(['response-units'], []);

			const { result } = renderHook(() => useAssignResponseUnit(), {
				wrapper: createWrapper(),
			});

			const assignmentData = {
				requestId: 1,
				assignedBy: 300,
				assignedUnitId: 500,
			};

			await result.current.mutateAsync(assignmentData);

			// Wait a bit for invalidation to take effect
			await waitFor(() => {
				const deploymentQuery = queryClient.getQueryCache().find({
					queryKey: ['deploymentRequests'],
				});
				expect(deploymentQuery?.state.isInvalidated).toBe(true);
			});
		});
	});

	describe('useAssignFillUnit', () => {
		const mockFillUnitResponse = {
			success: true,
			assignedUnitId: 500,
			message: 'Fill unit assignment successful',
		};

		it('should assign fill unit with personnel and resources successfully', async () => {
			mockedApi.assignFillUnitToDeploymentRequest.mockResolvedValue(mockFillUnitResponse);

			const { result } = renderHook(() => useAssignFillUnit(), {
				wrapper: createWrapper(),
			});

			const fillUnitData = {
				requestId: 1,
				assignedBy: 300,
				assignedUnitId: 500,
				assignedPersonnel: [
					{ slotId: 0, userId: 501, specialization: 'paramedic' as const },
					{ slotId: 1, userId: 502, specialization: 'driver' as const },
				],
				allocatedResources: [
					{ resourceId: 101, quantity: 2, isPrimary: true },
					{ resourceId: 102, quantity: 5, isPrimary: false },
				],
				notes: 'Full unit assignment with personnel and resources',
			};

			await result.current.mutateAsync(fillUnitData);

			expect(mockedApi.assignFillUnitToDeploymentRequest).toHaveBeenCalledTimes(1);
			// Check that the first argument matches our fill unit data
			const callArgs = mockedApi.assignFillUnitToDeploymentRequest.mock.calls[0];
			expect(callArgs).toBeDefined();
			expect(callArgs![0]).toEqual(fillUnitData);
		});

		it('should invalidate multiple queries on successful fill unit assignment', async () => {
			mockedApi.assignFillUnitToDeploymentRequest.mockResolvedValue(mockFillUnitResponse);

			// Pre-populate cache with some data
			queryClient.setQueryData(['deploymentRequests'], []);
			queryClient.setQueryData(['deployment-request'], []);
			queryClient.setQueryData(['response-units'], []);
			queryClient.setQueryData(['users'], []);
			queryClient.setQueryData(['resources'], []);

			const { result } = renderHook(() => useAssignFillUnit(), {
				wrapper: createWrapper(),
			});

			const fillUnitData = {
				requestId: 1,
				assignedBy: 300,
				assignedUnitId: 500,
				assignedPersonnel: [{ slotId: 0, userId: 501, specialization: 'paramedic' as const }],
				allocatedResources: [{ resourceId: 101, quantity: 1, isPrimary: true }],
			};

			await result.current.mutateAsync(fillUnitData);

			// Wait for invalidation to take effect
			await waitFor(() => {
				const deploymentQuery = queryClient.getQueryCache().find({
					queryKey: ['deploymentRequests'],
				});
				const deploymentRequestQuery = queryClient.getQueryCache().find({
					queryKey: ['deployment-request'],
				});
				const responseUnitsQuery = queryClient.getQueryCache().find({
					queryKey: ['response-units'],
				});
				const usersQuery = queryClient.getQueryCache().find({
					queryKey: ['users'],
				});
				const resourcesQuery = queryClient.getQueryCache().find({
					queryKey: ['resources'],
				});

				expect(deploymentQuery?.state.isInvalidated).toBe(true);
				expect(deploymentRequestQuery?.state.isInvalidated).toBe(true);
				expect(responseUnitsQuery?.state.isInvalidated).toBe(true);
				expect(usersQuery?.state.isInvalidated).toBe(true);
				expect(resourcesQuery?.state.isInvalidated).toBe(true);
			});
		});
	});

	describe('useIncidentForResponder', () => {
		const mockIncident = {
			incidentId: 42,
			regionId: 1,
			title: 'Warehouse Fire',
			location: 'District 9',
			status: 'Open' as const,
			severity: 'HIGH' as const,
			gripLevel: 2,
			description: 'Fire in warehouse',
			reportedBy: 'Fire Department',
			reportedAt: new Date('2024-01-15T10:00:00Z'),
			createdAt: new Date('2024-01-15T10:00:00Z'),
			updatedAt: new Date('2024-01-15T10:00:00Z'),
			latitude: 52.52,
			longitude: 13.405,
		};

		it('should fetch incident for responder successfully', async () => {
			mockedDeploymentApi.getIncidentForResponder.mockResolvedValue(mockIncident);

			const { result } = renderHook(() => useIncidentForResponder(123), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.incident).toEqual(mockIncident));

			expect(result.current.incident).toEqual(mockIncident);
			expect(result.current.loading).toBe(false);
			expect(mockedDeploymentApi.getIncidentForResponder).toHaveBeenCalledWith(123);
		});

		it('should handle null response when no incident assigned', async () => {
			mockedDeploymentApi.getIncidentForResponder.mockResolvedValue(null);

			const { result } = renderHook(() => useIncidentForResponder(456), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.incident).toBeNull());
			await waitFor(() => expect(result.current.loading).toBe(false));

			expect(result.current.incident).toBeNull();
		});

		it('should handle error when fetching incident', async () => {
			const error = new Error('Failed to fetch incident');
			mockedDeploymentApi.getIncidentForResponder.mockRejectedValue(error);

			const { result } = renderHook(() => useIncidentForResponder(789), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.error).toBeTruthy());

			expect(result.current.incident).toBeNull();
			expect(result.current.error).toBe('Failed to fetch incident');
		});

		it('should not fetch when responderId is undefined', () => {
			const { result } = renderHook(() => useIncidentForResponder(undefined), {
				wrapper: createWrapper(),
			});

			expect(result.current.loading).toBe(false);
			expect(result.current.incident).toBeNull();
			expect(mockedDeploymentApi.getIncidentForResponder).not.toHaveBeenCalled();
		});
	});
});
