import { describe, it, expect } from 'vitest';
import { axios as axiosInstance } from '@/lib/axios';

describe('lib/axios interceptors', () => {
	it('adds Authorization header when token present', async () => {
		localStorage.setItem('auth_token', 'tok-123');

		// Access the registered request interceptor handlers in a typed way
		type ReqHandler = { fulfilled?: (config: Record<string, unknown>) => unknown };
		const requestHandlers = (
			axiosInstance.interceptors.request as unknown as { handlers: ReqHandler[] }
		).handlers;
		expect(requestHandlers.length).toBeGreaterThan(0);
		if (!requestHandlers[0] || !requestHandlers[0].fulfilled)
			throw new Error('no request interceptor fulfilled handler');
		const fulfilled = requestHandlers[0].fulfilled as (cfg: Record<string, unknown>) => unknown;

		const config: Record<string, unknown> = { headers: {} };
		const out = fulfilled(config);
		expect(out).toBeDefined();
		const outObj = out as { headers?: Record<string, string> };
		expect(outObj.headers).toBeDefined();
		expect(outObj.headers?.Authorization).toBe('Bearer tok-123');
	});

	it('response error handler rejects axios errors', async () => {
		type ResHandler = { rejected?: (err: unknown) => Promise<unknown> };
		const responseHandlers = (
			axiosInstance.interceptors.response as unknown as { handlers: ResHandler[] }
		).handlers;
		expect(responseHandlers.length).toBeGreaterThan(0);
		if (!responseHandlers[0] || !responseHandlers[0].rejected)
			throw new Error('no response interceptor rejected handler');
		const rejected = responseHandlers[0].rejected as (err: unknown) => Promise<unknown>;

		const fakeAxiosError: unknown = { isAxiosError: true, response: { status: 401 } };

		await expect(rejected(fakeAxiosError)).rejects.toEqual(fakeAxiosError);
	});
});
