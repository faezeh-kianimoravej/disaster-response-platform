import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	assignResponseUnitToDeploymentRequest,
	assignFillUnitToDeploymentRequest,
	type FillUnitAssignmentRequest,
} from '@/api/deployment/deployment';

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

// Export types for components
export type { FillUnitAssignmentRequest };
