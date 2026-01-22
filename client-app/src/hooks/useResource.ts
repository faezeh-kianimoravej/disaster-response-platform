import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getResourcesByDepartmentId,
	getResourceById,
	addResource,
	updateResource,
	deleteResource,
} from '@/api/resource';
import type { Resource, ResourceFormData, ResourceStatus } from '@/types/resource';
import { RESOURCE_QUERY_KEYS } from '@/hooks/queryKeys';

export function useResources(departmentId?: number, options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? !!departmentId;
	const listKey = departmentId ? RESOURCE_QUERY_KEYS.list(departmentId) : ['resources', 'none'];

	const listQuery = useQuery<Resource[], Error>({
		queryKey: listKey,
		queryFn: () => getResourcesByDepartmentId(departmentId as number),
		enabled: enabled && !!departmentId,
		staleTime: 1000 * 60 * 5,
	});

	const { data, isLoading, isFetching, error, refetch } = listQuery;

	return useMemo(
		() => ({
			resources: data ?? [],
			loading: isLoading,
			isFetching,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, isFetching, error, refetch]
	);
}

export function useResource(id?: number, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();

	const singleQuery = useQuery<Resource | undefined, Error>({
		queryKey: id ? RESOURCE_QUERY_KEYS.item(id) : ['resource', 'none'],
		queryFn: () => getResourceById(id as number),
		enabled: (options?.enabled ?? true) && !!id,
		staleTime: 1000 * 60 * 5,
	});

	const {
		data: resourceData,
		isLoading: resourceLoading,
		error: resourceError,
		refetch: refetchSingle,
	} = singleQuery;

	const fetchResource = async () => {
		if (!id) return undefined;
		return queryClient.fetchQuery({
			queryKey: RESOURCE_QUERY_KEYS.item(id),
			queryFn: () => getResourceById(id as number),
		});
	};

	return useMemo(
		() => ({
			resource: resourceData ?? null,
			loading: resourceLoading,
			error: resourceError?.message ?? null,
			refetch: refetchSingle,
			fetchResource,
		}),
		[resourceData, resourceLoading, resourceError, refetchSingle, fetchResource]
	);
}

export function useCreateResource(departmentId: number) {
	const queryClient = useQueryClient();
	return useMutation<Resource, Error, { data: ResourceFormData; status?: ResourceStatus }>({
		mutationFn: ({ data, status }) => addResource(data, status),
		onSuccess: saved => {
			queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.list(departmentId) });
			queryClient.setQueryData(RESOURCE_QUERY_KEYS.item(saved.resourceId), saved);
		},
	});
}

export function useUpdateResource(departmentId: number) {
	const queryClient = useQueryClient();
	return useMutation<Resource, Error, { id: number; data: ResourceFormData }>({
		mutationFn: ({ id, data }) =>
			updateResource({ ...(data as unknown as Resource), resourceId: id } as Resource),
		onSuccess: updated => {
			queryClient.setQueryData(RESOURCE_QUERY_KEYS.item(Number(updated.resourceId)), updated);
			queryClient.invalidateQueries({ queryKey: RESOURCE_QUERY_KEYS.list(departmentId) });
		},
	});
}

export function useDeleteResource() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, { id: number; departmentId: number }>({
		mutationFn: ({ id }) => deleteResource(id),
		onSuccess: (_data, { id, departmentId }) => {
			const listKey = RESOURCE_QUERY_KEYS.list(departmentId);
			const itemKey = RESOURCE_QUERY_KEYS.item(id);

			const cachedList = queryClient.getQueryData<Resource[]>(listKey);
			if (cachedList) {
				const filteredList = cachedList.filter(r => Number(r.resourceId) !== Number(id));
				queryClient.setQueryData(listKey, filteredList);
			}

			queryClient.removeQueries({ queryKey: itemKey });
		},
	});
}
