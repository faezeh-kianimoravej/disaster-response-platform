import { BaseApi } from '@/api/base';
import type { Municipality } from '@/types/municipality';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_MUNICIPALITY;
const municipalityApi = new BaseApi(`${API_BASE_URL}/municipality`);

export async function getMunicipalities(): Promise<Municipality[]> {
	return await municipalityApi.get<Municipality[]>('/all');
}

export async function getMunicipalityById(id: number): Promise<Municipality> {
	return await municipalityApi.get<Municipality>(`/${id}`);
}
