import { useState, useCallback } from 'react';
import type { Region } from '@/types/region';
import { getRegionById, getRegions } from '@/api/region';

export function useRegion() {
	const [region, setRegion] = useState<Region | null>(null);
	const [regions, setRegions] = useState<Region[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchRegion = useCallback(async (regionId: number) => {
		setLoading(true);
		setError(null);
		try {
			const data = await getRegionById(regionId);
			setRegion(data);
			setLoading(false);
			return data;
		} catch (err: unknown) {
			setError((err instanceof Error && err.message) || 'Error fetching region');
			setRegion(null);
			setLoading(false);
			return null;
		}
	}, []);

	const fetchRegions = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getRegions();
			setRegions(data);
			setLoading(false);
			return data;
		} catch (err: unknown) {
			setError((err instanceof Error && err.message) || 'Error fetching regions');
			setRegions([]);
			setLoading(false);
			return [];
		}
	}, []);

	return { region, regions, loading, error, fetchRegion, fetchRegions };
}
