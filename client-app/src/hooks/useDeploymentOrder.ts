import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createDeploymentOrder,
	getDeploymentOrderByIncidentId,
	getDeploymentRequestById,
	getAvailableUsersForUnit,
	getAvailableResourcesForUnit,
	assignDeploymentRequest,
} from '@/api/deploymentOrder';
import type {
	DeploymentOrder,
	DeploymentOrderFormData,
	DeploymentRequest,
} from '@/types/deployment';
import type { User } from '@/types/user';
import type { Resource } from '@/types/resource';
import type { ResponseUnitType } from '@/types/responseUnit';
import { DEPLOYMENT_ORDER_QUERY_KEYS, DEPLOYMENT_REQUEST_QUERY_KEYS } from '@/hooks/queryKeys';

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

// --- Allocation Hooks ---

export function useAvailableUsersForUnit(
	departmentId?: number,
	unitType?: ResponseUnitType,
	options?: { enabled?: boolean }
) {
	return useQuery<User[], Error>({
		queryKey: ['deployment-allocation', 'available-users', departmentId, unitType],
		queryFn: () =>
			departmentId && unitType
				? getAvailableUsersForUnit(departmentId, unitType)
				: Promise.resolve([]),
		enabled: (options?.enabled ?? true) && !!departmentId && !!unitType,
		staleTime: 1000 * 60 * 2, // Shorter stale time for real-time allocation
	});
}

export function useAvailableResourcesForUnit(
	departmentId?: number,
	unitType?: ResponseUnitType,
	options?: { enabled?: boolean }
) {
	return useQuery<Resource[], Error>({
		queryKey: ['deployment-allocation', 'available-resources', departmentId, unitType],
		queryFn: () =>
			departmentId && unitType
				? getAvailableResourcesForUnit(departmentId, unitType)
				: Promise.resolve([]),
		enabled: (options?.enabled ?? true) && !!departmentId && !!unitType,
		staleTime: 1000 * 60 * 2, // Shorter stale time for real-time allocation
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
