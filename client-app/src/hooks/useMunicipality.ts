import { useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Municipality } from '@/types/municipality';
import { getMunicipalityById, getMunicipalitiesByRegionId } from '@/api/municipality';
import { MUNICIPALITY_QUERY_KEYS } from '@/hooks/queryKeys';

export function useMunicipalities(regionId?: number, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();

	const enabled = options?.enabled ?? !!regionId;
	const listKey = regionId ? MUNICIPALITY_QUERY_KEYS.list(regionId) : ['municipalities', 'none'];
	const listQuery = useQuery<Municipality[], Error>({
		queryKey: listKey,
		queryFn: () => getMunicipalitiesByRegionId(regionId!),
		enabled,
		staleTime: 1000 * 60 * 5,
	});

	const municipalities = listQuery.data ?? [];
	const loading = listQuery.isLoading;
	const isFetching = listQuery.isFetching;
	const error = listQuery.error?.message ?? null;

	const refetch = listQuery.refetch;
	const ensureMunicipalities = async () =>
		queryClient.fetchQuery({
			queryKey: listKey,
			queryFn: () => getMunicipalitiesByRegionId(regionId!),
		});

	return useMemo(
		() => ({ municipalities, loading, isFetching, error, refetch, ensureMunicipalities }),
		[municipalities, loading, isFetching, error, refetch, ensureMunicipalities]
	);
}

export function useMunicipality(id?: number, regionId?: number) {
	const queryClient = useQueryClient();

	let listCache: Municipality[] | undefined;
	if (regionId) {
		listCache = queryClient.getQueryData<Municipality[] | undefined>(
			MUNICIPALITY_QUERY_KEYS.list(regionId)
		);
	} else {
		listCache = undefined;
	}
	const listItem = id ? listCache?.find(m => m.municipalityId === id) : undefined;

	const shouldFetch = !!id && !listItem;

	if (listItem) {
		const refetch = () =>
			queryClient.fetchQuery({
				queryKey: MUNICIPALITY_QUERY_KEYS.item(id!),
				queryFn: () => getMunicipalityById(id!),
			});

		return useMemo(
			() => ({ municipality: listItem, loading: false, isFetching: false, error: null, refetch }),
			[listItem]
		);
	}

	const singleQuery = useQuery<Municipality, Error>({
		queryKey: id ? MUNICIPALITY_QUERY_KEYS.item(id) : ['municipality', 'none'],
		queryFn: () => getMunicipalityById(id!),
		enabled: shouldFetch,
		staleTime: 1000 * 60 * 5,
	});

	const municipality = singleQuery.data ?? null;
	const loading = singleQuery.isLoading;
	const isFetching = singleQuery.isFetching;
	const error = singleQuery.error?.message ?? null;

	const refetch = singleQuery.refetch;

	useEffect(() => {
		const data = singleQuery.data;
		if (!data || !regionId) return;
		queryClient.setQueryData<Municipality[] | undefined>(
			MUNICIPALITY_QUERY_KEYS.list(regionId),
			old => {
				if (!old) return [data];
				const exists = old.some(m => m.municipalityId === data.municipalityId);
				return exists ? old : [...old, data];
			}
		);
	}, [singleQuery.data, queryClient, regionId]);

	return useMemo(
		() => ({ municipality, loading, isFetching, error, refetch }),
		[municipality, loading, isFetching, error, refetch]
	);
}
