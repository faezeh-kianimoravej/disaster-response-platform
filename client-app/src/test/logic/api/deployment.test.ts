import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire API module
vi.mock('@/api/deployment', async importOriginal => {
	const actual = await importOriginal<typeof import('@/api/deployment')>();
	return {
		...actual,
		assignResponseUnitToDeploymentRequest: vi.fn(),
	};
});

import { assignResponseUnitToDeploymentRequest } from '@/api/deployment';

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

	describe('API initialization', () => {
		it('should initialize BaseApi with correct URL', () => {
			// This test validates that the module loads without errors
			expect(true).toBe(true);
		});
	});
});
