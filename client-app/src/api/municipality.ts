// import { BaseApi } from './base';
import type { Municipality } from '@/types/municipality';

// Create municipality API instance (ready for production use)
// const municipalityApi = new BaseApi('/api/municipalities');

// fake data for development
const fakeMunicipalities: Municipality[] = [
	{
		MunicipalityId: 301,
		RegionId: 10, // IJsselland
		Name: 'Zwolle',
		Image: '/images/response.png',
	},
	{
		MunicipalityId: 302,
		RegionId: 10, // IJsselland
		Name: 'Kampen',
		Image: '/images/police-car.png',
	},
	{
		MunicipalityId: 303,
		RegionId: 10, // IJsselland
		Name: 'Deventer',
		Image: '/images/fire-truck.png',
	},
];

export async function getMunicipalities(): Promise<Municipality[]> {
	// In production: return municipalityApi.get<Municipality[]>();
	return Promise.resolve(fakeMunicipalities);
}

// No Add, Edit, or Delete functions for Municipality
