import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeploymentRequestById, assignDeploymentRequest } from '@/api/deploymentRequest';
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

export function useAssignDeploymentRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (assignmentData: {
			requestId: number;
			assignedBy: number;
			assignedUsers: number[];
			assignedResources: { resourceId: number; quantity: number }[];
			notes?: string;
		}) => {
			return await assignDeploymentRequest(assignmentData);
		},
		onSuccess: (_data, variables) => {
			// Invalidate related queries
			queryClient.invalidateQueries({
				queryKey: DEPLOYMENT_REQUEST_QUERY_KEYS.item(variables.requestId),
			});
			// Invalidate availability queries for the department
			queryClient.invalidateQueries({
				queryKey: ['deployment-allocation'],
			});
			// Invalidate user and resource queries
			queryClient.invalidateQueries({
				queryKey: ['users'],
			});
			queryClient.invalidateQueries({
				queryKey: ['resources'],
			});
		},
	});
}
