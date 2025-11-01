import { BaseApi } from '@/api/base';
import type { Region } from '@/types/region';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const regionApi = new BaseApi(`${API_BASE_URL}/regions`);

type ApiRegion = {
	regionId: number | string;
	name: string;
	image: string;
	municipalities?: Array<{
		municipalityId: number | string;
		name: string;
		image: string;
		regionId: number | string;
	}>;
};

function fromApiRegion(a: ApiRegion): Region {
	return {
		regionId: Number(a.regionId),
		name: a.name,
		image: a.image,
		municipalities: (a.municipalities ?? []).map(m => ({
			municipalityId: Number(m.municipalityId),
			name: m.name,
			image: m.image,
			regionId: Number(m.regionId),
		})),
	};
}

function fromApiRegions(list: ApiRegion[]): Region[] {
	return list.map(fromApiRegion);
}

export async function getRegionById(regionId: number): Promise<Region> {
	const data = await regionApi.get<ApiRegion>(`/${regionId}`);
	return fromApiRegion(data);
}

export async function getRegions(): Promise<Region[]> {
	const data = await regionApi.get<ApiRegion[]>(``);
	return fromApiRegions(data);
}

export async function addRegion(formData: Region): Promise<Region> {
	const created = await regionApi.post<ApiRegion>('', formData);
	return fromApiRegion(created);
}

export async function updateRegion(updated: Region): Promise<Region> {
	const updatedApi = await regionApi.put<ApiRegion>(`/${updated.regionId}`, updated);
	return fromApiRegion(updatedApi);
}

export async function deleteRegion(id: number): Promise<void> {
	return await regionApi.delete(`/${id}`);
}
