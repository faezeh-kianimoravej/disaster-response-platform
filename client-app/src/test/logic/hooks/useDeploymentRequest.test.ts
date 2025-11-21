import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/utils';
import {
	useDeploymentRequest,
	useAssignResponseUnitToDeploymentRequest,
} from '@/hooks/useDeploymentRequest';
import * as deploymentRequestApi from '@/api/deploymentRequest';
import type { DeploymentRequest } from '@/types/deployment';
import React, { type ReactNode } from 'react';

// Mock the API module
vi.mock('@/api/deploymentRequest');

const mockedApi = vi.mocked(deploymentRequestApi);

describe('useDeploymentRequest hooks', () => {
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

	describe('useDeploymentRequest', () => {
		const mockDeploymentRequest: DeploymentRequest = {
			requestId: 1,
			incidentId: 100,
			deploymentOrderId: 200,
			requestedBy: 300,
			requestedAt: new Date('2024-01-15T10:30:00Z'),
			targetDepartmentId: 400,
			priority: 'CRITICAL',
			requestedUnitType: 'Fire truck',
			requestedQuantity: 2,
			assignedUnitId: 500,
			assignedBy: 600,
			assignedAt: new Date('2024-01-15T11:00:00Z'),
			status: 'assigned',
		};

		it('should fetch deployment request successfully', async () => {
			mockedApi.getDeploymentRequestById.mockResolvedValue(mockDeploymentRequest);

			const { result } = renderHook(() => useDeploymentRequest(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));

			expect(result.current.data).toEqual(mockDeploymentRequest);
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toBe(null);
			expect(mockedApi.getDeploymentRequestById).toHaveBeenCalledWith(1);
		});

		it('should handle loading state', () => {
			mockedApi.getDeploymentRequestById.mockImplementation(() => new Promise(() => {})); // Never resolves

			const { result } = renderHook(() => useDeploymentRequest(1), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(true);
			expect(result.current.data).toBeUndefined();
			expect(result.current.error).toBe(null);
		});

		it('should handle error state', async () => {
			const error = new Error('Failed to fetch deployment request');
			mockedApi.getDeploymentRequestById.mockRejectedValue(error);

			const { result } = renderHook(() => useDeploymentRequest(1), {
				wrapper: createWrapper(),
			});

			await waitFor(() => expect(result.current.isError).toBe(true));

			expect(result.current.data).toBeUndefined();
			expect(result.current.isLoading).toBe(false);
			expect(result.current.error).toEqual(error);
		});

		it('should not fetch when requestId is undefined', () => {
			const { result } = renderHook(() => useDeploymentRequest(undefined), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(mockedApi.getDeploymentRequestById).not.toHaveBeenCalled();
		});

		it('should not fetch when enabled is false', () => {
			const { result } = renderHook(() => useDeploymentRequest(1, { enabled: false }), {
				wrapper: createWrapper(),
			});

			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(mockedApi.getDeploymentRequestById).not.toHaveBeenCalled();
		});

		it('should use correct query key', () => {
			renderHook(() => useDeploymentRequest(1), {
				wrapper: createWrapper(),
			});

			const queryData = queryClient.getQueryCache().find({
				queryKey: ['deployment-request', 1],
			});

			expect(queryData).toBeDefined();
		});
	});

	describe('useAssignResponseUnitToDeploymentRequest', () => {
		const mockAssignmentResponse = {
			success: true,
			assignedUnitId: 500,
			message: 'ResponseUnit assignment successful',
		};

		it('should assign response unit to deployment request successfully', async () => {
			mockedApi.assignResponseUnitToDeploymentRequest.mockResolvedValue(mockAssignmentResponse);

			const { result } = renderHook(() => useAssignResponseUnitToDeploymentRequest(), {
				wrapper: createWrapper(),
			});

			const assignmentData = {
				requestId: 1,
				assignedBy: 300,
				assignedUnitId: 500,
				notes: 'Test ResponseUnit assignment',
			};

			await result.current.mutateAsync(assignmentData);

			expect(mockedApi.assignResponseUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
		});

		it('should handle assignment error', async () => {
			const error = new Error('ResponseUnit assignment failed');
			mockedApi.assignResponseUnitToDeploymentRequest.mockRejectedValue(error);

			const { result } = renderHook(() => useAssignResponseUnitToDeploymentRequest(), {
				wrapper: createWrapper(),
			});

			const assignmentData = {
				requestId: 1,
				assignedBy: 300,
				assignedUnitId: 500,
			};

			await expect(result.current.mutateAsync(assignmentData)).rejects.toThrow(
				'ResponseUnit assignment failed'
			);
			expect(mockedApi.assignResponseUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
		});

		it('should invalidate queries on successful assignment', async () => {
			mockedApi.assignResponseUnitToDeploymentRequest.mockResolvedValue(mockAssignmentResponse);

			// Pre-populate cache with some data
			queryClient.setQueryData(['deployment-request', 1], { requestId: 1 });
			queryClient.setQueryData(['response-units'], []);

			const { result } = renderHook(() => useAssignResponseUnitToDeploymentRequest(), {
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
					queryKey: ['deployment-request', 1],
				});
				expect(deploymentQuery?.state.isInvalidated).toBe(true);
			});
		});

		it('should track mutation state correctly', async () => {
			mockedApi.assignResponseUnitToDeploymentRequest.mockImplementation(
				() => new Promise(resolve => setTimeout(() => resolve(mockAssignmentResponse), 100))
			);

			const { result } = renderHook(() => useAssignResponseUnitToDeploymentRequest(), {
				wrapper: createWrapper(),
			});

			expect(result.current.isPending).toBe(false);
			expect(result.current.isSuccess).toBe(false);
			expect(result.current.isError).toBe(false);

			const assignmentData = {
				requestId: 1,
				assignedBy: 300,
				assignedUnitId: 500,
			};

			const mutationPromise = result.current.mutateAsync(assignmentData);

			// Should be pending immediately
			await waitFor(() => expect(result.current.isPending).toBe(true));

			await mutationPromise;

			// Should be successful after completion
			await waitFor(() => {
				expect(result.current.isPending).toBe(false);
				expect(result.current.isSuccess).toBe(true);
			});
		});
	});
});
