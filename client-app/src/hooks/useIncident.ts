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
import { useState } from 'react';
import incidentRequestSchema from '@/validation/incidentValidation';
import type { ApiError } from '@/api/base';

export function useIncidents(regionId: number, options?: { enabled?: boolean }) {
	const listQuery = useQuery<Incident[], Error>({
		queryKey: INCIDENT_QUERY_KEYS.list(regionId),
		queryFn: () => getIncidents(regionId),
		enabled: (options?.enabled ?? true) && regionId > 0,
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

export function useUpdateIncidentForm(regionId: number) {
	const mutation = useUpdateIncident(regionId);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validation, setValidation] = useState<Record<string, string> | null>(null);

	async function submit(id: number, formData: Partial<IncidentFormData>) {
		setLoading(true);
		setError(null);
		setValidation(null);

		const prioritySchema = incidentRequestSchema.pick({ severity: true, gripLevel: true });
		const parsed = prioritySchema.safeParse({
			severity: formData.severity,
			gripLevel: formData.gripLevel,
		});
		if (!parsed.success) {
			const zErr = parsed.error;
			const flat = zErr.flatten().fieldErrors as Record<string, string[] | undefined>;
			const map: Record<string, string> = {};
			for (const k in flat) {
				const arr = flat[k];
				if (Array.isArray(arr) && arr[0]) map[k] = arr[0];
			}
			setValidation(Object.keys(map).length > 0 ? map : null);
			setLoading(false);
			return false;
		}

		try {
			await mutation.mutateAsync({ id, data: formData });
			setLoading(false);
			return true;
		} catch (err) {
			const apiErr = err as ApiError;
			if (apiErr && apiErr.validationErrors) {
				setValidation(apiErr.validationErrors as Record<string, string>);
			} else {
				setError(apiErr?.message ?? String(err));
			}
			setLoading(false);
			return false;
		}
	}

	return { submit, loading, error, validation } as const;
}
