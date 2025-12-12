import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatRelativeTime } from '@/utils/time';

describe('time utils', () => {
	beforeEach(() => {
		// Reset the time before each test
		vi.clearAllMocks();
	});

	describe('formatRelativeTime', () => {
		it('should return empty string for undefined or empty input', () => {
			expect(formatRelativeTime()).toBe('');
			expect(formatRelativeTime('')).toBe('');
			expect(formatRelativeTime(undefined)).toBe('');
		});

		it('should return "just now" for times within the last 60 seconds', () => {
			const now = new Date();
			const tenSecondsAgo = new Date(now.getTime() - 10 * 1000).toISOString();
			expect(formatRelativeTime(tenSecondsAgo)).toBe('just now');

			const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000).toISOString();
			expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now');
		});

		it('should return minutes ago for times between 1 and 60 minutes ago', () => {
			const now = new Date();

			const oneMinuteAgo = new Date(now.getTime() - 60 * 1000).toISOString();
			expect(formatRelativeTime(oneMinuteAgo)).toBe('1m');

			const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
			expect(formatRelativeTime(fifteenMinutesAgo)).toBe('15m');

			const fiftynineMinutesAgo = new Date(now.getTime() - 59 * 60 * 1000).toISOString();
			expect(formatRelativeTime(fiftynineMinutesAgo)).toBe('59m');
		});

		it('should return hours ago for times between 1 and 24 hours ago', () => {
			const now = new Date();

			const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
			expect(formatRelativeTime(oneHourAgo)).toBe('1h');

			const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();
			expect(formatRelativeTime(threeHoursAgo)).toBe('3h');

			const twentythreeHoursAgo = new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString();
			expect(formatRelativeTime(twentythreeHoursAgo)).toBe('23h');
		});

		it('should return "Yesterday" for dates from yesterday', () => {
			const now = new Date();
			const yesterday = new Date();
			yesterday.setDate(now.getDate() - 1);
			yesterday.setHours(0, 0, 0, 0); // Set to midnight to ensure it's always 24+ hours ago
			expect(formatRelativeTime(yesterday.toISOString())).toBe('Yesterday');
		});

		it('should return formatted date for older dates in the same year', () => {
			const now = new Date();
			const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
			const result = formatRelativeTime(twoWeeksAgo.toISOString());

			// Should be a short, locale date like "1 Jan" or "Jan 1"
			expect(result).toMatch(/^(\d{1,2}\s+\w{3}|\w{3}\s+\d{1,2})$/);
		});

		it('should include year for dates from previous years', () => {
			const lastYear = new Date();
			lastYear.setFullYear(lastYear.getFullYear() - 1);
			const result = formatRelativeTime(lastYear.toISOString());

			// Should include the year
			expect(result).toMatch(/\d{4}/);
		});

		it('should handle invalid date strings gracefully', () => {
			expect(formatRelativeTime('invalid-date')).toBe('Invalid Date');
			expect(formatRelativeTime('not-a-date')).toBe('Invalid Date');
			expect(formatRelativeTime('2024-13-45')).toBe('Invalid Date');
		});

		it('should handle ISO 8601 formatted dates correctly', () => {
			const now = new Date();
			const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
			const isoString = fiveMinutesAgo.toISOString(); // e.g., "2024-01-15T10:30:00.000Z"
			expect(formatRelativeTime(isoString)).toBe('5m');
		});

		it('should handle different timezone offsets', () => {
			// Create a date in a different timezone representation
			const now = new Date();
			const pastDate = new Date(now.getTime() - 30 * 60 * 1000);
			const result = formatRelativeTime(pastDate.toISOString());
			expect(result).toBe('30m');
		});
	});
});
