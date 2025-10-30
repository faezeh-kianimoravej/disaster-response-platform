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

export async function addRegion(formData: Region): Promise<Region> {
	return await regionApi.post<Region>('', formData);
}

export async function updateRegion(updated: Region): Promise<Region> {
	return await regionApi.put<Region>(`/${updated.regionId}`, updated);
}

export async function deleteRegion(id: number): Promise<void> {
	return await regionApi.delete(`/${id}`);
}
