import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import { BaseApi } from '@/api/base';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('BaseApi', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls GET with baseUrl + endpoint and params', async () => {
		const api = new BaseApi('/api/things');
		vi.mocked(axios.get).mockResolvedValueOnce({ data: { ok: true } });
		await api.get('/list', { page: 1 });
		expect(axios.get).toHaveBeenCalledWith('/api/things/list', { params: { page: 1 } });
	});

	it('calls POST/PUT/PATCH/DELETE with baseUrl + endpoint', async () => {
		const api = new BaseApi('/api/things');
		vi.mocked(axios.post).mockResolvedValueOnce({ data: { id: 1 } });
		await api.post('', { name: 'x' });
		expect(axios.post).toHaveBeenCalledWith('/api/things', { name: 'x' });

		vi.mocked(axios.put).mockResolvedValueOnce({ data: { id: 1 } });
		await api.put('/1', { name: 'y' });
		expect(axios.put).toHaveBeenCalledWith('/api/things/1', { name: 'y' });

		vi.mocked(axios.patch).mockResolvedValueOnce({ data: { id: 1 } });
		await api.patch('/1', { name: 'z' });
		expect(axios.patch).toHaveBeenCalledWith('/api/things/1', { name: 'z' });

		vi.mocked(axios.delete).mockResolvedValueOnce({ data: undefined });
		await api.delete('/1');
		expect(axios.delete).toHaveBeenCalledWith('/api/things/1');
	});

	it('normalizes axios error with validation errors', async () => {
		const api = new BaseApi('/api/things');
		const axiosError: {
			message: string;
			code: string;
			response: { status: number; data: { errors: Record<string, string> } };
		} = {
			message: 'Request failed with status code 400',
			code: 'ERR_BAD_REQUEST',
			response: { status: 400, data: { errors: { name: 'Required' } } },
		};
		vi.mocked(axios.post).mockRejectedValueOnce(axiosError);

		await expect(api.post('', { name: '' })).rejects.toMatchObject({
			message: expect.stringContaining('Request failed'),
			status: 400,
			code: 'ERR_BAD_REQUEST',
			validationErrors: { name: 'Required' },
		});
	});

	it('normalizes generic error without response', async () => {
		const api = new BaseApi('/api/things');
		vi.mocked(axios.get).mockRejectedValueOnce({ message: 'Boom' });
		await expect(api.get('')).rejects.toMatchObject({
			message: 'Boom',
			status: 500,
		});
	});
});
