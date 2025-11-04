import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import { listUsers, getUser, createUser, updateUser, removeUser, login } from '@/api/user';
import type { UserCreateFormData, UserEditFormData } from '@/types/user';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('User API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('listUsers - GET /users', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
		await listUsers();
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users'), {
			params: undefined,
		});
	});

	it('getUser - GET /users/:id', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({
			data: {
				userId: 1,
				firstName: 'A',
				lastName: 'B',
				email: 'a@b.com',
				mobile: '1',
				roles: [],
				departmentId: null,
				municipalityId: null,
				regionId: null,
			},
		});
		await getUser('1');
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/users/1'), {
			params: undefined,
		});
	});

	it('createUser - POST /users', async () => {
		const payload: UserCreateFormData = {
			firstName: 'New',
			lastName: 'User',
			email: 'new@user.com',
			mobile: '123',
			password: 'pw',
			roles: [],
		};
		vi.mocked(axios.post).mockResolvedValueOnce({ data: { ...payload, userId: 99 } });
		await createUser(payload);
		expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/users'), payload);
	});

	it('updateUser - PUT /users/:id', async () => {
		const formData: UserEditFormData = {
			userId: 5,
			firstName: 'Upd',
			lastName: 'User',
			email: 'upd@user.com',
			mobile: '123',
			password: 'pw',
			roles: [{ roleType: 'Citizen', departmentId: null, municipalityId: null, regionId: null }],
		};
		vi.mocked(axios.put).mockResolvedValueOnce({ data: { id: 5, ...formData, deleted: false } });
		await updateUser(formData);
		// userId is NOT included in the request body, only in the URL
		expect(axios.put).toHaveBeenCalledWith(
			expect.stringContaining('/users/5'),
			expect.objectContaining({
				firstName: 'Upd',
				lastName: 'User',
				email: 'upd@user.com',
				mobile: '123',
				password: 'pw',
				roles: formData.roles,
			})
		);
	});

	it('removeUser - DELETE /users/:id', async () => {
		vi.mocked(axios.delete).mockResolvedValueOnce({ data: undefined });
		await removeUser('7');
		expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/users/7'));
	});

	it('login - POST /users/login with credentials', async () => {
		vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: 'abc' } });
		await login('a@b.com', 'secret');
		expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/users.*login/), {
			email: 'a@b.com',
			password: 'secret',
		});
	});
});
