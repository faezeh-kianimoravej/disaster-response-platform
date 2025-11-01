import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Region } from '@/types/region';
import { getRegionById, getRegions } from '@/api/region';
import { REGION_QUERY_KEYS } from '@/hooks/queryKeys';

export function useRegions(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? false;

	const listQuery = useQuery<Region[], Error>({
		queryKey: REGION_QUERY_KEYS.list,
		queryFn: getRegions,
		enabled,
		staleTime: 1000 * 60 * 5,
	});

	const { data, isLoading, error, refetch } = listQuery;

	return useMemo(
		() => ({
			regions: data ?? [],
			loading: isLoading,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, error, refetch]
	);
}

export function useRegion(id?: number, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();

	const singleQuery = useQuery<Region | undefined, Error>({
		queryKey: id ? REGION_QUERY_KEYS.item(id) : ['region', 'none'],
		queryFn: () => getRegionById(id as number),
		enabled: (options?.enabled ?? true) && !!id,
		staleTime: 1000 * 60 * 5,
	});

	const { data: regionData, isLoading, error, refetch } = singleQuery;

	const fetchRegion = async (regionId?: number) => {
		const rid = regionId ?? id;
		if (!rid) return undefined;
		return queryClient.fetchQuery({
			queryKey: REGION_QUERY_KEYS.item(rid),
			queryFn: () => getRegionById(rid as number),
		});
	};

	return useMemo(
		() => ({
			region: regionData ?? null,
			loading: isLoading,
			error: error?.message ?? null,
			refetch,
			fetchRegion,
		}),
		[regionData, isLoading, error, refetch, fetchRegion]
	);
}
