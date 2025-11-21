import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test/utils';
import { useAssignResponseUnit } from '@/hooks/useDeployment';
import * as deploymentApi from '@/api/deployment';
import React, { type ReactNode } from 'react';

// Mock the API module
vi.mock('@/api/deployment');

const mockedApi = vi.mocked(deploymentApi);

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
});
