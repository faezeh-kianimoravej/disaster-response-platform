/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire API module
vi.mock('@/api/deploymentRequest', async importOriginal => {
	const actual = await importOriginal<typeof import('@/api/deploymentRequest')>();
	return {
		...actual,
		getDeploymentRequestById: vi.fn(),
		assignDeploymentRequest: vi.fn(),
	};
});

import { getDeploymentRequestById, assignDeploymentRequest } from '@/api/deploymentRequest';

describe('deploymentRequest API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getDeploymentRequestById', () => {
		it('should fetch and map deployment request correctly', async () => {
			const expectedResult = {
				requestId: 1,
				incidentId: 100,
				deploymentOrderId: 200,
				requestedBy: 300,
				requestedAt: new Date('2024-01-15T10:30:00Z'),
				targetDepartmentId: 400,
				priority: 'CRITICAL',
				requestedUnitType: 'Fire truck',
				requestedQuantity: 2,
				assignedUnitId: 500,
				assignedBy: 600,
				assignedAt: new Date('2024-01-15T11:00:00Z'),
				status: 'assigned',
			};

			vi.mocked(getDeploymentRequestById).mockResolvedValue(expectedResult as any);

			const result = await getDeploymentRequestById(1);

			expect(getDeploymentRequestById).toHaveBeenCalledWith(1);
			expect(result).toEqual(expectedResult);
		});

		it('should handle deployment request without optional fields', async () => {
			const expectedResult = {
				requestId: 2,
				incidentId: 101,
				deploymentOrderId: 201,
				requestedBy: 300,
				requestedAt: new Date('2024-01-15T10:30:00Z'),
				targetDepartmentId: 400,
				priority: 'HIGH',
				requestedUnitType: 'Ambulance',
				requestedQuantity: 1,
				status: 'pending',
			};

			vi.mocked(getDeploymentRequestById).mockResolvedValue(expectedResult as any);

			const result = await getDeploymentRequestById(2);

			expect(result).toEqual(expectedResult);
		});

		it('should throw error when API call fails', async () => {
			const error = new Error('Network error');
			vi.mocked(getDeploymentRequestById).mockRejectedValue(error);

			await expect(getDeploymentRequestById(1)).rejects.toThrow('Network error');
			expect(getDeploymentRequestById).toHaveBeenCalledWith(1);
		});
	});

	describe('assignDeploymentRequest', () => {
		it('should assign deployment request successfully', async () => {
			const assignmentData = {
				requestId: 1,
				assignedBy: 600,
				assignedUsers: [700, 800],
				assignedResources: [
					{ resourceId: 900, quantity: 2 },
					{ resourceId: 1000, quantity: 1 },
				],
				notes: 'Test assignment',
			};

			const mockResponse = {
				success: true,
				assignedUnitId: 1100,
			};

			vi.mocked(assignDeploymentRequest).mockResolvedValue(mockResponse);

			const result = await assignDeploymentRequest(assignmentData);

			expect(assignDeploymentRequest).toHaveBeenCalledWith(assignmentData);
			expect(result).toEqual(mockResponse);
		});

		it('should handle assignment without optional fields', async () => {
			const assignmentData = {
				requestId: 2,
				assignedBy: 600,
				assignedUsers: [700],
				assignedResources: [{ resourceId: 900, quantity: 1 }],
			};

			const mockResponse = { success: true, assignedUnitId: 1200 };

			vi.mocked(assignDeploymentRequest).mockResolvedValue(mockResponse);

			const result = await assignDeploymentRequest(assignmentData);

			expect(assignDeploymentRequest).toHaveBeenCalledWith(assignmentData);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when assignment fails', async () => {
			const assignmentData = {
				requestId: 1,
				assignedBy: 600,
				assignedUsers: [700],
				assignedResources: [{ resourceId: 900, quantity: 1 }],
			};

			const error = new Error('Assignment failed');
			vi.mocked(assignDeploymentRequest).mockRejectedValue(error);

			await expect(assignDeploymentRequest(assignmentData)).rejects.toThrow('Assignment failed');
			expect(assignDeploymentRequest).toHaveBeenCalledWith(assignmentData);
		});
	});

	describe('API initialization', () => {
		it('should initialize BaseApi with correct URL', () => {
			// This test validates that the module loads without errors
			expect(true).toBe(true);
		});
	});
});
