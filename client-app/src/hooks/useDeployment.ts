import { useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
	assignResponseUnitToDeploymentRequest,
	assignFillUnitToDeploymentRequest,
	type FillUnitAssignmentRequest,
} from '@/api/deployment/deployment';
import { getIncidentForResponder } from '@/api/deployment';
import type { Incident } from '@/types/incident';

// Legacy assignment hook (for backward compatibility)
export function useAssignResponseUnit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: assignResponseUnitToDeploymentRequest,
		onSuccess: () => {
			// Invalidate deployment request queries
			queryClient.invalidateQueries({ queryKey: ['deploymentRequests'] });
			// Invalidate response unit queries
			queryClient.invalidateQueries({ queryKey: ['response-units'] });
		},
	});
}

// New Fill Unit assignment hook
export function useAssignFillUnit() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: assignFillUnitToDeploymentRequest,
		onSuccess: () => {
			// Invalidate deployment request queries
			queryClient.invalidateQueries({ queryKey: ['deploymentRequests'] });
			queryClient.invalidateQueries({ queryKey: ['deployment-request'] });
			// Invalidate response unit queries
			queryClient.invalidateQueries({ queryKey: ['response-units'] });
			// Invalidate user queries (as personnel assignments may have changed)
			queryClient.invalidateQueries({ queryKey: ['users'] });
			// Invalidate resource queries (as allocations may have changed)
			queryClient.invalidateQueries({ queryKey: ['resources'] });
		},
	});
}

// Responder incident hook
export function useIncidentForResponder(responderId?: number, options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? !!responderId;
	const query = useQuery<Incident | null, Error>({
		queryKey: ['deployment', 'responder', responderId, 'incident'],
		queryFn: () => getIncidentForResponder(responderId as number),
		enabled: enabled && !!responderId && responderId > 0,
		staleTime: 1000 * 60 * 2,
	});

	const { data, isLoading, error, refetch } = query;

	return useMemo(
		() => ({
			incident: data ?? null,
			loading: isLoading,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, error, refetch]
	);
}

// Export types for components
export type { FillUnitAssignmentRequest };
