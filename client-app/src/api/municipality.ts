import { BaseApi } from '@/api/base';
import type { Municipality } from '@/types/municipality';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const municipalityApi = new BaseApi(`${API_BASE_URL}/municipalities`);

type ApiMunicipality = {
	municipalityId: number | string;
	regionId: number | string;
	name: string;
	image: string;
};

function fromApiMunicipality(a: ApiMunicipality): Municipality {
	return {
		municipalityId: Number(a.municipalityId),
		regionId: Number(a.regionId),
		name: a.name,
		image: a.image,
	};
}

function fromApiMunicipalities(list: ApiMunicipality[]): Municipality[] {
	return list.map(fromApiMunicipality);
}

export async function getMunicipalityById(id: number): Promise<Municipality> {
	const data = await municipalityApi.get<ApiMunicipality>(`/${id}`);
	return fromApiMunicipality(data);
}

export async function getMunicipalitiesByRegionId(regionId: number): Promise<Municipality[]> {
	const data = await municipalityApi.get<ApiMunicipality[]>(`/region/${regionId}`);
	return fromApiMunicipalities(data);
}

export async function addMunicipality(formData: Municipality): Promise<Municipality> {
	const created = await municipalityApi.post<ApiMunicipality>('', formData);
	return fromApiMunicipality(created);
}

export async function updateMunicipality(updated: Municipality): Promise<Municipality> {
	const updatedApi = await municipalityApi.put<ApiMunicipality>(
		`/${updated.municipalityId}`,
		updated
	);
	return fromApiMunicipality(updatedApi);
}

export async function deleteMunicipality(id: number): Promise<void> {
	return await municipalityApi.delete(`/${id}`);
}
