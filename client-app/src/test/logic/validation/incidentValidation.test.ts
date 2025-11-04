import { describe, it, expect } from 'vitest';
import { incidentRequestSchema } from '@/validation/incidentValidation';

describe('Incident Validation', () => {
	it('accepts valid incident with all required fields', () => {
		const validIncident = {
			incidentId: 1,
			reportedBy: 'user@example.com',
			title: 'Fire Incident',
			severity: 'High',
			gripLevel: 3,
			status: 'Open',
			reportedAt: new Date(),
			regionId: 5,
		};

		const result = incidentRequestSchema.safeParse(validIncident);
		expect(result.success).toBe(true);
	});

	describe('ID validation', () => {
		it('rejects incidentId of 0', () => {
			const incident = {
				incidentId: 0,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 1,
				status: 'Open',
				reportedAt: new Date(),
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('incidentId');
				expect(issue!.message).toMatch(/must be 1 or higher/i);
			}
		});

		it('rejects negative incidentId', () => {
			const incident = {
				incidentId: -5,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 1,
				status: 'Open',
				reportedAt: new Date(),
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('incidentId');
			}
		});

		it('accepts incidentId of 1', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});

		it('rejects regionId of 0', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 1,
				status: 'Open',
				reportedAt: new Date(),
				regionId: 0,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('regionId');
				expect(issue!.message).toMatch(/must be 1 or higher/i);
			}
		});
	});

	describe('Latitude validation', () => {
		it('accepts latitude of -90', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'South Pole',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				latitude: -90,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});

		it('accepts latitude of 90', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'North Pole',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				latitude: 90,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});

		it('rejects latitude below -90', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				latitude: -91,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('latitude');
				expect(issue!.message).toMatch(/must be between -90 and 90/i);
			}
		});

		it('rejects latitude above 90', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				latitude: 91,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('latitude');
				expect(issue!.message).toMatch(/must be between -90 and 90/i);
			}
		});

		it('accepts incident without latitude (optional)', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});
	});

	describe('Longitude validation', () => {
		it('accepts longitude of -180', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'International Date Line West',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				longitude: -180,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});

		it('accepts longitude of 180', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'International Date Line East',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				longitude: 180,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});

		it('rejects longitude below -180', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				longitude: -181,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('longitude');
				expect(issue!.message).toMatch(/must be between -180 and 180/i);
			}
		});

		it('rejects longitude above 180', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				longitude: 181,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				const issue = result.error.issues[0];
				expect(issue).toBeDefined();
				expect(issue!.path).toContain('longitude');
				expect(issue!.message).toMatch(/must be between -180 and 180/i);
			}
		});

		it('accepts incident without longitude (optional)', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});
	});

	describe('Combined latitude and longitude validation', () => {
		it('accepts valid coordinates', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Amsterdam',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				latitude: 52.3676,
				longitude: 4.9041,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(true);
		});

		it('rejects when both coordinates are invalid', () => {
			const incident = {
				incidentId: 1,
				reportedBy: 'user@example.com',
				title: 'Test',
				severity: 'Low',
				gripLevel: 0,
				status: 'Open',
				reportedAt: new Date(),
				latitude: 100,
				longitude: 200,
				regionId: 1,
			};

			const result = incidentRequestSchema.safeParse(incident);
			expect(result.success).toBe(false);
			if (!result.success) {
				// Both should have errors
				expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
				const paths = result.error.issues.map(i => i.path[0]);
				expect(paths).toContain('latitude');
				expect(paths).toContain('longitude');
			}
		});
	});
});
