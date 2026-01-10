import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getIncidents,
	getIncidentById,
	createIncident,
	updateIncident,
	deleteIncident,
} from '@/api/incident';
import type { Incident, IncidentFormData } from '@/types/incident';
import { INCIDENT_QUERY_KEYS } from '@/hooks/queryKeys';

export function useIncidents(regionId?: number, options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? !!regionId;
	const listKey = regionId ? INCIDENT_QUERY_KEYS.list(regionId) : ['incidents', 'none'];
	const listQuery = useQuery<Incident[], Error>({
		queryKey: listKey,
		queryFn: () => getIncidents(regionId as number),
		enabled: enabled && !!regionId && regionId > 0,
		staleTime: 1000 * 60 * 2,
	});

	const { data, isLoading, error, refetch } = listQuery;

	return useMemo(
		() => ({
			incidents: data ?? [],
			loading: isLoading,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, error, refetch]
	);
}

export function useIncident(id?: number, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();

	const singleQuery = useQuery<Incident | undefined, Error>({
		queryKey: id ? INCIDENT_QUERY_KEYS.item(id) : ['incident', 'none'],
		queryFn: () => getIncidentById(id as number),
		enabled: (options?.enabled ?? true) && !!id,
		staleTime: 1000 * 60 * 2,
	});

	const {
		data: incidentData,
		isLoading: incidentLoading,
		error: incidentError,
		refetch: refetchSingle,
	} = singleQuery;

	const fetchIncident = async () => {
		if (!id) return undefined;
		return queryClient.fetchQuery({
			queryKey: INCIDENT_QUERY_KEYS.item(id),
			queryFn: () => getIncidentById(id as number),
		});
	};

	return useMemo(
		() => ({
			incident: incidentData ?? null,
			loading: incidentLoading,
			error: incidentError?.message ?? null,
			refetch: refetchSingle,
			fetchIncident,
		}),
		[incidentData, incidentLoading, incidentError, refetchSingle, fetchIncident]
	);
}

export function useCreateIncident(regionId: number) {
	const queryClient = useQueryClient();
	const mutation = useMutation<Incident, Error, IncidentFormData>({
		mutationFn: data => createIncident(data),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: INCIDENT_QUERY_KEYS.list(regionId) }),
	});
	return mutation;
}

export function useUpdateIncident(regionId: number) {
	const queryClient = useQueryClient();
	const mutation = useMutation<Incident, Error, { id: number; data: Partial<IncidentFormData> }>({
		mutationFn: ({ id, data }) => updateIncident(id, data),
		onSuccess: updated => {
			queryClient.setQueryData(INCIDENT_QUERY_KEYS.item(Number(updated.incidentId)), updated);
			queryClient.invalidateQueries({ queryKey: INCIDENT_QUERY_KEYS.list(regionId) });
		},
	});
	return mutation;
}

export function useDeleteIncident(regionId: number) {
	const queryClient = useQueryClient();
	const mutation = useMutation<void, Error, number>({
		mutationFn: id => deleteIncident(id),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: INCIDENT_QUERY_KEYS.list(regionId) });
			queryClient.removeQueries({ queryKey: INCIDENT_QUERY_KEYS.item(id) });
		},
	});
	return mutation;
}
