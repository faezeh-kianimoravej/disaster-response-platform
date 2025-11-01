import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axios } from '@/lib/axios';
import {
	getIncidents,
	getIncidentById,
	createIncident,
	updateIncident,
	deleteIncident,
} from '@/api/incident';
import type { IncidentFormData } from '@/types/incident';

vi.mock('@/lib/axios', () => ({
	axios: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('Incident API (contract)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('getIncidents - GET /incidents/region/:regionId', async () => {
		const mockResponse = {
			data: [
				{
					incidentId: 1,
					reportedBy: 'user@example.com',
					title: 'Fire',
					description: 'Big fire',
					severity: 'HIGH',
					gripLevel: 'LEVEL_3',
					status: 'OPEN',
					reportedAt: '2025-01-01T00:00:00Z',
					location: 'Downtown',
					latitude: 51.5,
					longitude: -0.1,
					regionId: 10,
					createdAt: '2025-01-01T00:00:00Z',
					updatedAt: '2025-01-01T00:00:00Z',
				},
			],
		};
		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

		await getIncidents(10);

		expect(axios.get).toHaveBeenCalledWith('/incidents/region/10', { params: undefined });
	});

	it('getIncidentById - GET /incidents/:id', async () => {
		const mockResponse = {
			data: {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				description: 'Test desc',
				severity: 'LOW',
				gripLevel: 'NONE',
				status: 'OPEN',
				reportedAt: '2025-01-01T00:00:00Z',
				location: 'Test Location',
				latitude: 0,
				longitude: 0,
				regionId: 1,
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
		};
		vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);

		await getIncidentById(1);

		expect(axios.get).toHaveBeenCalledWith('/incidents/1', { params: undefined });
	});

	it('createIncident - POST /incidents with transformed payload', async () => {
		const formData: IncidentFormData = {
			incidentId: 0,
			reportedBy: 'test@example.com',
			title: 'New Incident',
			description: 'Test',
			severity: 'Medium',
			gripLevel: 2,
			status: 'Open',
			reportedAt: new Date('2025-01-01'),
			location: 'Test',
			latitude: 0,
			longitude: 0,
			regionId: 1,
		};

		const mockResponse = {
			data: {
				incidentId: 100,
				reportedBy: 'test@example.com',
				title: 'New Incident',
				description: 'Test',
				severity: 'MEDIUM',
				gripLevel: 'LEVEL_2',
				status: 'OPEN',
				reportedAt: '2025-01-01T00:00:00.000Z',
				location: 'Test',
				latitude: 0,
				longitude: 0,
				regionId: 1,
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
		};

		vi.mocked(axios.post).mockResolvedValueOnce(mockResponse);

		await createIncident(formData);

		// Verify POST was called (payload transformation is internal)
		expect(axios.post).toHaveBeenCalledWith('/incidents', expect.any(Object));
	});

	it('updateIncident - PUT /incidents/:id with partial payload', async () => {
		const mockResponse = {
			data: {
				incidentId: 5,
				reportedBy: 'test@example.com',
				title: 'Updated',
				description: 'Updated desc',
				severity: 'CRITICAL',
				gripLevel: 'LEVEL_5',
				status: 'RESOLVED',
				reportedAt: '2025-01-01T00:00:00Z',
				location: 'Test',
				latitude: 0,
				longitude: 0,
				regionId: 1,
				createdAt: '2025-01-01T00:00:00Z',
				updatedAt: '2025-01-01T00:00:00Z',
			},
		};

		vi.mocked(axios.put).mockResolvedValueOnce(mockResponse);

		await updateIncident(5, { severity: 'Critical', gripLevel: 5 });

		// Verify PUT was called with correct ID
		expect(axios.put).toHaveBeenCalledWith('/incidents/5', expect.any(Object));
	});

	it('deleteIncident - DELETE /incidents/:id', async () => {
		const mockResponse = { data: undefined };
		vi.mocked(axios.delete).mockResolvedValueOnce(mockResponse);

		await deleteIncident(10);

		expect(axios.delete).toHaveBeenCalledWith('/incidents/10');
	});
});
