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
	it('createUser - POST /users with responderProfile', async () => {
		const payload: UserCreateFormData & {
			responderProfile?: import('@/types/responderSpecialization').ResponderProfile;
		} = {
			firstName: 'Responder',
			lastName: 'User',
			email: 'responder@user.com',
			mobile: '321',
			password: 'StrongPw1!',
			roles: [{ roleType: 'Responder', departmentId: 2, municipalityId: null, regionId: null }],
			responderProfile: {
				userId: 123,
				departmentId: 2,
				primarySpecialization: 'firefighter',
				secondarySpecializations: ['paramedic', 'driver'],
				isAvailable: true,
				currentDeploymentId: 42,
			},
		};
		// Simulate backend echoing responderProfile in response
		vi.mocked(axios.post).mockResolvedValueOnce({ data: { ...payload, userId: 123 } });
		const result = await createUser(payload);
		const postCall = vi.mocked(axios.post).mock.calls[0];
		expect(postCall).toBeDefined();
		expect(result.responderProfile).toBeDefined();
		expect(result.responderProfile?.primarySpecialization).toBe('firefighter');
		expect(result.responderProfile?.secondarySpecializations).toContain('paramedic');
	});

	it('updateUser - PUT /users/:id with responderProfile', async () => {
		const formData: UserEditFormData & {
			responderProfile?: import('@/types/responderSpecialization').ResponderProfile;
		} = {
			userId: 55,
			firstName: 'Upd',
			lastName: 'Responder',
			email: 'upd@responder.com',
			mobile: '555',
			password: 'StrongPw1!',
			roles: [{ roleType: 'Responder', departmentId: 2, municipalityId: null, regionId: null }],
			responderProfile: {
				userId: 55,
				departmentId: 2,
				primarySpecialization: 'paramedic',
				secondarySpecializations: ['firefighter'],
				isAvailable: false,
			},
		};
		vi.mocked(axios.put).mockResolvedValueOnce({ data: { id: 55, ...formData, deleted: false } });
		const result = await updateUser(formData);
		const putCall = vi.mocked(axios.put).mock.calls[0];
		expect(putCall).toBeDefined();
		expect(result.responderProfile).toBeDefined();
		expect(result.responderProfile?.primarySpecialization).toBe('paramedic');
		expect(result.responderProfile?.secondarySpecializations).toContain('firefighter');
	});
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
