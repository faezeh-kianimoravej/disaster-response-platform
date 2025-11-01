import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import { getRegions, getRegionById, addRegion, updateRegion, deleteRegion } from '@/api/region';
import type { Region } from '@/types/region';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('Region API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getRegions - GET /regions', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
		await getRegions();
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/regions'), {
			params: undefined,
		});
	});

	it('getRegionById - GET /regions/:id', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({ data: { regionId: 1, name: 'West', image: '' } });
		await getRegionById(1);
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/regions/1'), {
			params: undefined,
		});
	});

	it('addRegion - POST /regions', async () => {
		const payload: Region = { regionId: 0, name: 'New', image: '', municipalities: [] };
		vi.mocked(axios.post).mockResolvedValueOnce({ data: { ...payload, regionId: 10 } });
		await addRegion(payload);
		expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/regions'), payload);
	});

	it('updateRegion - PUT /regions/:id', async () => {
		const updated: Region = { regionId: 3, name: 'Upd', image: '', municipalities: [] };
		vi.mocked(axios.put).mockResolvedValueOnce({ data: updated });
		await updateRegion(updated);
		expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/regions/3'), updated);
	});

	it('deleteRegion - DELETE /regions/:id', async () => {
		vi.mocked(axios.delete).mockResolvedValueOnce({ data: undefined });
		await deleteRegion(4);
		expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/regions/4'));
	});
});
