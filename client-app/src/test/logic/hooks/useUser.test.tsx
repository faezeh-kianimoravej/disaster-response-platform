import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { useCreateUser, useUpdateUser, useUser, useUsers, useRemoveUser } from '@/hooks/useUser';
import type { User, UserCreateFormData, UserEditFormData } from '@/types/user';
import type { ApiError } from '@/api/base';
import type { Role } from '@/types/role';

vi.mock('@/api/user', () => ({
	createUser: vi.fn(),
	updateUser: vi.fn(),
	removeUser: vi.fn(),
	getUser: vi.fn(),
	listUsers: vi.fn(),
}));

const api = await import('@/api/user');

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false, gcTime: 0, staleTime: 0 },
			mutations: { retry: false },
		},
	});
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	}
	return Wrapper;
}

describe('useUser hooks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('useCreateUser submits successfully', async () => {
		const mockUser: User = {
			userId: 1,
			firstName: 'A',
			lastName: 'B',
			email: 'a@b.com',
			mobile: '1',
			roles: [] as Role[],
			deleted: false,
		};
		vi.mocked(api.createUser).mockResolvedValueOnce(mockUser);
		const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() });

		const payload: UserCreateFormData = {
			firstName: 'A',
			lastName: 'B',
			email: 'a@b.com',
			mobile: '1',
			password: 'pw',
			roles: [],
		};
		let ok = false;
		await act(async () => {
			ok = await result.current.submit(payload);
		});
		expect(ok).toBe(true);
		await waitFor(() => expect(result.current.user).toEqual(mockUser));
		expect(result.current.error).toBeNull();
	});

	it('useCreateUser handles ApiError', async () => {
		vi.mocked(api.createUser).mockRejectedValueOnce({ message: 'Boom', status: 400 } as ApiError);
		const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() });
		const payload: UserCreateFormData = {
			firstName: 'A',
			lastName: 'B',
			email: 'a@b.com',
			mobile: '1',
			password: 'pw',
			roles: [],
		};
		// Since hooks now bubble errors to the caller, we expect submit to throw
		await act(async () => {
			await expect(result.current.submit(payload)).rejects.toMatchObject({ message: 'Boom' });
		});
		// Error state is also set for internal tracking
		await waitFor(() => expect(result.current.error).toBe('Boom'));
	});

	it('useUpdateUser submits successfully', async () => {
		const mockUser: User = {
			userId: 2,
			firstName: 'U',
			lastName: 'S',
			email: 'u@s.com',
			mobile: '2',
			roles: [] as Role[],
			deleted: false,
		};
		vi.mocked(api.updateUser).mockResolvedValueOnce(mockUser);
		const { result } = renderHook(() => useUpdateUser(), { wrapper: createWrapper() });
		const payload: UserEditFormData = { ...mockUser, password: 'pw' };
		let ok = false;
		await act(async () => {
			ok = await result.current.submit(payload);
		});
		expect(ok).toBe(true);
		await waitFor(() => expect(result.current.user).toEqual(mockUser));
	});

	it('useUser fetches a user by id', async () => {
		const { getUser } = await import('@/api/user');
		const mock: User = {
			userId: 10,
			firstName: 'X',
			lastName: 'Y',
			email: 'x@y.com',
			mobile: '9',
			roles: [] as Role[],
			deleted: false,
		};
		vi.mocked(getUser).mockResolvedValueOnce(mock);
		const { result } = renderHook(() => useUser(10), { wrapper: createWrapper() });
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.user).toEqual(mock);
	});

	it('useUsers returns users', async () => {
		const { listUsers } = await import('@/api/user');
		const mockUsers: User[] = [
			{
				userId: 3,
				firstName: 'A',
				lastName: 'B',
				email: 'a@b.com',
				mobile: '1',
				roles: [] as Role[],
				deleted: false,
			},
		];
		vi.mocked(listUsers).mockResolvedValueOnce(mockUsers);
		const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.users.length).toBeGreaterThan(0);
	});

	it('useRemoveUser success and failure', async () => {
		vi.mocked(api.removeUser).mockResolvedValueOnce(undefined);
		const { result } = renderHook(() => useRemoveUser(), { wrapper: createWrapper() });
		const ok1 = await result.current.remove('1');
		expect(ok1).toBe(true);
		await waitFor(() => expect(result.current.success).toBe(true));

		vi.mocked(api.removeUser).mockRejectedValueOnce(new Error('Nope'));
		const ok2 = await result.current.remove('2');
		expect(ok2).toBe(false);
		await waitFor(() => expect(result.current.error).toBe('Nope'));
	});
});
