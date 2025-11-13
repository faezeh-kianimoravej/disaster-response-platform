import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import {
	getResourcesByDepartmentId,
	getResourceTypes,
	getResourceById,
	addResource,
	updateResource,
	deleteResource,
} from '@/api/resource';
import type { Resource } from '@/types/resource';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('Resource API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getResourcesByDepartmentId - GET /resources/department/:id', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
		await getResourcesByDepartmentId(15);
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/resources/department/15'), {
			params: undefined,
		});
	});

	it('getResourceTypes - GET /resources/resource-types', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({ data: { FIRE_TRUCK: 'Fire Truck' } });
		await getResourceTypes();
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/resources/resource-types'), {
			params: undefined,
		});
	});

	it('getResourceById - GET /resources/:id', async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({
			data: {
				resourceId: 1,
				departmentId: 2,
				name: 'Hose',
				quantity: 1,
				available: 1,
				resourceType: 'Other',
				description: '',
				image: '',
			},
		});
		await getResourceById(1);
		expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/resources/1'), {
			params: undefined,
		});
	});

	it('addResource - POST /resources', async () => {
		const payload: Resource = {
			resourceId: 0,
			departmentId: 2,
			name: 'New',
			description: '',
			category: 'VEHICLE',
			resourceType: 'COMMAND_VEHICLE',
			resourceKind: 'UNIQUE',
			status: 'AVAILABLE',
			totalQuantity: 3,
			availableQuantity: 3,
			unit: 'UNITS',
			isTrackable: false,
			image: '',
		};
		vi.mocked(axios.post).mockResolvedValueOnce({ data: { ...payload, resourceId: 23 } });
		await addResource(payload);
		expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/resources'), payload);
	});

	it('updateResource - PUT /resources/:id', async () => {
		const updated: Resource = {
			resourceId: 9,
			departmentId: 2,
			name: 'Upd',
			description: '',
			category: 'VEHICLE',
			resourceType: 'COMMAND_VEHICLE',
			resourceKind: 'UNIQUE',
			status: 'AVAILABLE',
			totalQuantity: 3,
			availableQuantity: 2,
			unit: 'UNITS',
			isTrackable: false,
			image: '',
		};
		vi.mocked(axios.put).mockResolvedValueOnce({ data: updated });
		await updateResource(updated);
		expect(axios.put).toHaveBeenCalledWith(expect.stringContaining('/resources/9'), updated);
	});

	it('deleteResource - DELETE /resources/:id', async () => {
		vi.mocked(axios.delete).mockResolvedValueOnce({ data: undefined });
		await deleteResource(12);
		expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/resources/12'));
	});
});
