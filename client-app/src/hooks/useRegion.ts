import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Region } from '@/types/region';
import { getRegionById, getRegions } from '@/api/region';
import { REGION_QUERY_KEYS } from '@/hooks/queryKeys';

export function useRegion(options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();

	const listQuery = useQuery<Region[], Error>({
		queryKey: REGION_QUERY_KEYS.list,
		queryFn: getRegions,
		enabled: options?.enabled ?? false,
		staleTime: 1000 * 60 * 5,
	});

	const regions = listQuery.data ?? [];
	const loading = listQuery.isLoading;
	const error = listQuery.error?.message ?? null;
	const { refetch } = listQuery;

	const fetchRegion = async (regionId: number) => {
		return await queryClient.fetchQuery({
			queryKey: REGION_QUERY_KEYS.item(regionId),
			queryFn: () => getRegionById(regionId),
		});
	};

	const fetchRegions = () =>
		queryClient.fetchQuery({
			queryKey: REGION_QUERY_KEYS.list,
			queryFn: getRegions,
		});

	return useMemo(
		() => ({
			region: null as Region | null,
			regions,
			loading,
			error,
			refetch,
			fetchRegion,
			fetchRegions,
		}),
		[regions, loading, error, refetch, fetchRegion, fetchRegions]
	);
}
