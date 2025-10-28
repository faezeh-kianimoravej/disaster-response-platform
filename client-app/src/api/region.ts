import { BaseApi } from '@/api/base';
import type { Region } from '@/types/region';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const regionApi = new BaseApi(`${API_BASE_URL}/regions`);

export async function getRegionById(regionId: number): Promise<Region> {
	return await regionApi.get<Region>(`/${regionId}`);
}

export async function getRegions(): Promise<Region[]> {
	return await regionApi.get<Region[]>(``);
}
