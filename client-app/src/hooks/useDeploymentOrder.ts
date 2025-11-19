import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createDeploymentOrder, getDeploymentOrderByIncidentId } from '@/api/deploymentOrder';
import type { DeploymentOrder, DeploymentOrderFormData } from '@/types/deployment';
import { DEPLOYMENT_ORDER_QUERY_KEYS } from '@/hooks/queryKeys';

export function useDeploymentOrderByIncidentId(
	incidentId?: number,
	options?: { enabled?: boolean }
) {
	return useQuery<DeploymentOrder | undefined, Error>({
		queryKey: incidentId
			? DEPLOYMENT_ORDER_QUERY_KEYS.byIncident(incidentId)
			: ['deployment-order', 'none'],
		queryFn: () => (incidentId ? getDeploymentOrderByIncidentId(incidentId) : undefined),
		enabled: (options?.enabled ?? true) && !!incidentId,
		staleTime: 1000 * 60 * 5,
	});
}

export function useCreateDeploymentOrder() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (form: DeploymentOrderFormData) => {
			return await createDeploymentOrder(form);
		},
		onSuccess: (_data, variables) => {
			if (variables.incidentId) {
				queryClient.invalidateQueries({
					queryKey: DEPLOYMENT_ORDER_QUERY_KEYS.byIncident(variables.incidentId),
				});
			}
		},
	});
}
