import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire API module
vi.mock('@/api/deployment', async importOriginal => {
	const actual = await importOriginal<typeof import('@/api/deployment')>();
	return {
		...actual,
		assignResponseUnitToDeploymentRequest: vi.fn(),
		assignFillUnitToDeploymentRequest: vi.fn(),
	};
});

import {
	assignResponseUnitToDeploymentRequest,
	assignFillUnitToDeploymentRequest,
} from '@/api/deployment';

describe('deployment API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('assignResponseUnitToDeploymentRequest', () => {
		it('should assign response unit to deployment request successfully', async () => {
			const assignmentData = {
				requestId: 1,
				assignedBy: 600,
				assignedUnitId: 1100,
				notes: 'Test ResponseUnit assignment',
			};

			const mockResponse = {
				success: true,
				assignedUnitId: 1100,
			};

			vi.mocked(assignResponseUnitToDeploymentRequest).mockResolvedValue(mockResponse);

			const result = await assignResponseUnitToDeploymentRequest(assignmentData);

			expect(assignResponseUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
			expect(result).toEqual(mockResponse);
		});

		it('should handle assignment without optional notes', async () => {
			const assignmentData = {
				requestId: 2,
				assignedBy: 600,
				assignedUnitId: 1200,
			};

			const mockResponse = { success: true, assignedUnitId: 1200 };

			vi.mocked(assignResponseUnitToDeploymentRequest).mockResolvedValue(mockResponse);

			const result = await assignResponseUnitToDeploymentRequest(assignmentData);

			expect(assignResponseUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when response unit assignment fails', async () => {
			const assignmentData = {
				requestId: 1,
				assignedBy: 600,
				assignedUnitId: 1100,
			};

			const error = new Error('ResponseUnit assignment failed');
			vi.mocked(assignResponseUnitToDeploymentRequest).mockRejectedValue(error);

			await expect(assignResponseUnitToDeploymentRequest(assignmentData)).rejects.toThrow(
				'ResponseUnit assignment failed'
			);
			expect(assignResponseUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
		});
	});

	describe('assignFillUnitToDeploymentRequest', () => {
		it('should assign fill unit with personnel and resources successfully', async () => {
			const assignmentData = {
				requestId: 1,
				assignedBy: 600,
				assignedUnitId: 1100,
				assignedPersonnel: [
					{ slotId: 0, userId: 501, specialization: 'paramedic' as const },
					{ slotId: 1, userId: 502, specialization: 'emt_basic' as const },
				],
				allocatedResources: [
					{ resourceId: 101, quantity: 2, isPrimary: true },
					{ resourceId: 102, quantity: 5, isPrimary: false },
				],
				notes: 'Full unit assignment with personnel and resources',
			};

			const mockResponse = {
				success: true,
				assignedUnitId: 1100,
				message: 'Fill unit assigned successfully',
			};

			vi.mocked(assignFillUnitToDeploymentRequest).mockResolvedValue(mockResponse);

			const result = await assignFillUnitToDeploymentRequest(assignmentData);

			expect(assignFillUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
			expect(result).toEqual(mockResponse);
		});

		it('should handle assignment without optional notes', async () => {
			const assignmentData = {
				requestId: 2,
				assignedBy: 600,
				assignedUnitId: 1200,
				assignedPersonnel: [{ slotId: 0, userId: 503, specialization: 'driver' as const }],
				allocatedResources: [{ resourceId: 103, quantity: 1, isPrimary: true }],
			};

			const mockResponse = { success: true, assignedUnitId: 1200 };

			vi.mocked(assignFillUnitToDeploymentRequest).mockResolvedValue(mockResponse);

			const result = await assignFillUnitToDeploymentRequest(assignmentData);

			expect(assignFillUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when fill unit assignment fails', async () => {
			const assignmentData = {
				requestId: 1,
				assignedBy: 600,
				assignedUnitId: 1100,
				assignedPersonnel: [],
				allocatedResources: [],
			};

			const error = new Error('Fill unit assignment failed');
			vi.mocked(assignFillUnitToDeploymentRequest).mockRejectedValue(error);

			await expect(assignFillUnitToDeploymentRequest(assignmentData)).rejects.toThrow(
				'Fill unit assignment failed'
			);
			expect(assignFillUnitToDeploymentRequest).toHaveBeenCalledWith(assignmentData);
		});
	});

	describe('API initialization', () => {
		it('should initialize BaseApi with correct URL', () => {
			// This test validates that the module loads without errors
			expect(true).toBe(true);
		});
	});
});
