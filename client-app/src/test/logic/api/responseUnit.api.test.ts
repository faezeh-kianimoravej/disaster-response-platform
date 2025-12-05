import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import type { AxiosResponse } from 'axios';
import {
	createResponseUnit,
	getResponseUnitById,
	getResponseUnitsByDepartmentId,
	getAllResponseUnits,
	updateResponseUnit,
	deleteResponseUnit,
	searchAvailableResponseUnits,
} from '@/api/deployment/responseUnit';
import type { ResponseUnitFormData, ResponseUnitType } from '@/types/responseUnit';
import { ResourceStatus } from '@/types/resource';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('ResponseUnit API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('createResponseUnit - posts payload to /response-units', async () => {
		const form: ResponseUnitFormData = {
			unitName: 'Alpha 1',
			departmentId: 10,
			unitType: 'Ambulance' as ResponseUnitType,
			defaultResources: [],
			defaultPersonnel: [],
		};
		const data = {
			unitId: 7,
			unitName: 'Alpha 1',
			departmentId: 10,
			unitType: 'AMBULANCE',
			defaultResources: [],
			defaultPersonnel: [],
			currentResources: [],
			currentPersonnel: [],
			status: 'available',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const mockResponse: AxiosResponse<typeof data> = { data } as unknown as AxiosResponse<
			typeof data
		>;

		vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

		const result = await createResponseUnit(form, 'AVAILABLE' as ResourceStatus);

		expect(axios.post).toHaveBeenCalledWith(
			expect.stringContaining('/response-units'),
			expect.objectContaining({ unitName: 'Alpha 1' })
		);
		expect(result.unitId).toBe(7);
		expect(result.unitName).toBe('Alpha 1');
	});

	it('getResponseUnitById - GET /response-units/:id', async () => {
		const data2 = {
			unitId: 5,
			unitName: 'Bravo',
			departmentId: 2,
			unitType: 'FIRE_TRUCK',
			defaultResources: [],
			defaultPersonnel: [],
			currentResources: [],
			currentPersonnel: [],
			status: 'AVAILABLE',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const mockResponse2: AxiosResponse<typeof data2> = { data: data2 } as unknown as AxiosResponse<
			typeof data2
		>;

		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse2);

		const r = await getResponseUnitById(5);

		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/response-units/5'), {
			params: undefined,
		});
		expect(r.unitId).toBe(5);
		expect(r.createdAt instanceof Date).toBeTruthy();
	});

	it('getResponseUnitsByDepartmentId - GET /response-units/department/:id', async () => {
		const mockData: unknown[] = [];
		const mockResponse3: AxiosResponse<typeof mockData> = {
			data: mockData,
		} as unknown as AxiosResponse<typeof mockData>;
		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse3);

		const r = await getResponseUnitsByDepartmentId(10);

		expect(axios.get).toHaveBeenCalledWith(
			expect.stringContaining('/response-units/department/10'),
			{ params: undefined }
		);
		expect(Array.isArray(r)).toBe(true);
	});

	it('getAllResponseUnits - GET /response-units', async () => {
		const mockData2: unknown[] = [];
		const mockResponse4: AxiosResponse<typeof mockData2> = {
			data: mockData2,
		} as unknown as AxiosResponse<typeof mockData2>;
		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse4);

		const r = await getAllResponseUnits();

		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/response-units'), {
			params: undefined,
		});
		expect(Array.isArray(r)).toBe(true);
	});

	it('updateResponseUnit - PUT /response-units/:id', async () => {
		const form: ResponseUnitFormData = {
			unitName: 'Updated',
			departmentId: 10,
			unitType: 'AMBULANCE' as ResponseUnitType,
			defaultResources: [],
			defaultPersonnel: [],
		};

		const data3 = {
			unitId: 9,
			unitName: 'Updated',
			departmentId: 10,
			unitType: 'AMBULANCE',
			defaultResources: [],
			defaultPersonnel: [],
			currentResources: [],
			currentPersonnel: [],
			status: 'available',
		};
		const mockResponse5: AxiosResponse<typeof data3> = { data: data3 } as unknown as AxiosResponse<
			typeof data3
		>;
		vi.mocked(axios.put).mockResolvedValueOnce(mockResponse5);

		const r = await updateResponseUnit(9, form, 'AVAILABLE' as ResourceStatus);

		expect(axios.put).toHaveBeenCalledWith(
			expect.stringContaining('/response-units/9'),
			expect.objectContaining({ unitName: 'Updated' })
		);
		expect(r.unitId).toBe(9);
	});

	it('deleteResponseUnit - DELETE /response-units/:id', async () => {
		vi.mocked(axios.delete).mockResolvedValueOnce({ data: null } as unknown as AxiosResponse<null>);
		await deleteResponseUnit(12);
		expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/response-units/12'));
	});

	it('searchAvailableResponseUnits - maps unitType to backend format and POST /response-units/search', async () => {
		const data4 = [
			{
				unitId: 1,
				unitName: 'Alpha',
				departmentId: 10,
				departmentName: 'Alpha Dept',
				unitType: 'AMBULANCE',
				distanceKm: 1.2,
			},
		];

		const mockResponse6: AxiosResponse<typeof data4> = { data: data4 } as unknown as AxiosResponse<
			typeof data4
		>;

		vi.mocked(axios.post).mockResolvedValueOnce(mockResponse6);

		const req: { incidentId: number; unitType: ResponseUnitType; departmentId: number } = {
			incidentId: 42,
			unitType: 'Ambulance' as ResponseUnitType,
			departmentId: 10,
		};
		const result = await searchAvailableResponseUnits(req);

		// Ensure the posted unitType was converted to backend enum style
		expect(axios.post).toHaveBeenCalledWith(
			expect.stringContaining('/response-units/search'),
			expect.objectContaining({ unitType: 'AMBULANCE' })
		);
		expect(Array.isArray(result)).toBe(true);
	});
});
