import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignResponseUnitToDeploymentRequest } from '@/api/deployment';

// Assignment hook
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
