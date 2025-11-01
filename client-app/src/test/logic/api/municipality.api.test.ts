import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import {
	getMunicipalitiesByRegionId,
	getMunicipalityById,
	addMunicipality,
	updateMunicipality,
	deleteMunicipality,
} from '@/api/municipality';
import type { Municipality } from '@/types/municipality';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('Municipality API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getMunicipalitiesByRegionId - GET /municipalities/region/:regionId', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
		await getMunicipalitiesByRegionId(7);
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/municipalities/region/7'), {
			params: undefined,
		});
	});

	it('getMunicipalityById - GET /municipalities/:id', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({
			data: { municipalityId: 1, regionId: 2, name: 'X', image: '' },
		});
		await getMunicipalityById(1);
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/municipalities/1'), {
			params: undefined,
		});
	});

	it('addMunicipality - POST /municipalities', async () => {
		const payload: Municipality = { municipalityId: 0, regionId: 2, name: 'New', image: '' };
		vi.mocked(axios.post).mockResolvedValueOnce({ data: { ...payload, municipalityId: 11 } });
		await addMunicipality(payload);
		expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/municipalities'), payload);
	});

	it('updateMunicipality - PUT /municipalities/:id', async () => {
		const updated: Municipality = { municipalityId: 5, regionId: 2, name: 'Upd', image: '' };
		vi.mocked(axios.put).mockResolvedValueOnce({ data: updated });
		await updateMunicipality(updated);
		expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/municipalities/5'), updated);
	});

	it('deleteMunicipality - DELETE /municipalities/:id', async () => {
		vi.mocked(axios.delete).mockResolvedValueOnce({ data: undefined });
		await deleteMunicipality(9);
		expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/municipalities/9'));
	});
});
