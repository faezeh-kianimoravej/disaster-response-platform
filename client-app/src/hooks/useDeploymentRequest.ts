import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeploymentRequestById } from '@/api/deployment/deploymentRequest';
import { assignResponseUnitToDeploymentRequest } from '@/api/deployment/deployment';
import type { DeploymentRequest } from '@/types/deployment';
import { DEPLOYMENT_REQUEST_QUERY_KEYS } from '@/hooks/queryKeys';

export function useDeploymentRequest(requestId?: number, options?: { enabled?: boolean }) {
	return useQuery<DeploymentRequest | undefined, Error>({
		queryKey: requestId
			? DEPLOYMENT_REQUEST_QUERY_KEYS.item(requestId)
			: ['deployment-request', 'none'],
		queryFn: () => (requestId ? getDeploymentRequestById(requestId) : undefined),
		enabled: (options?.enabled ?? true) && !!requestId,
		staleTime: 1000 * 60 * 5,
	});
}

export function useAssignResponseUnitToDeploymentRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (assignmentData: {
			requestId: number;
			assignedBy: number;
			assignedUnitId: number;
			notes?: string;
		}) => {
			return await assignResponseUnitToDeploymentRequest(assignmentData);
		},
		onSuccess: (_data, variables) => {
			// Invalidate related queries
			queryClient.invalidateQueries({
				queryKey: DEPLOYMENT_REQUEST_QUERY_KEYS.item(variables.requestId),
			});
			// Invalidate response unit queries
			queryClient.invalidateQueries({
				queryKey: ['response-units'],
			});
		},
	});
}
