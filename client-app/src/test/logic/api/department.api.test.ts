import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import {
	getDepartmentsByMunicipalityId,
	getDepartmentById,
	addDepartment,
	updateDepartment,
	deleteDepartment,
} from '@/api/department';
import type { Department } from '@/types/department';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('Department API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getDepartmentsByMunicipalityId - GET /departments/municipality/:id', async () => {
		const mockResponse = {
			data: [
				{
					departmentId: 1,
					municipalityId: 10,
					name: 'Fire Dept',
					image: '/images/default.png',
				},
			],
		};
		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

		await getDepartmentsByMunicipalityId(10);

		// Verify correct endpoint is called (base URL is configurable via env)
		expect(axios.get).toHaveBeenCalledWith(
			expect.stringContaining('/departments/municipality/10'),
			{ params: undefined }
		);
	});

	it('getDepartmentById - GET /departments/:id', async () => {
		const mockResponse = {
			data: {
				departmentId: 1,
				municipalityId: 10,
				name: 'Police Dept',
				image: '/images/default.png',
			},
		};
		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

		await getDepartmentById(1);

		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/departments/1'), {
			params: undefined,
		});
	});

	it('addDepartment - POST /departments with payload', async () => {
		const newDept: Department = {
			departmentId: 0,
			municipalityId: 10,
			name: 'New Dept',
			image: '/images/default.png',
		};
		const mockResponse = {
			data: { ...newDept, departmentId: 123 },
		};
		vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

		await addDepartment(newDept);

		expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/departments'), newDept);
	});

	it('updateDepartment - PUT /departments/:id with payload', async () => {
		const updated: Department = {
			departmentId: 5,
			municipalityId: 10,
			name: 'Updated Dept',
			image: '/images/default.png',
		};
		const mockResponse = { data: updated };
		vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

		await updateDepartment(updated);

		expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/departments/5'), updated);
	});

	it('deleteDepartment - DELETE /departments/:id', async () => {
		const mockResponse = { data: undefined };
		vi.mocked(axios.delete).mockResolvedValueOnce(mockResponse);

		await deleteDepartment(10);

		expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/departments/10'));
	});
});
