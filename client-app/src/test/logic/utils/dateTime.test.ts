import { describe, it, expect } from 'vitest';
import { normalizeDate, toLocalISOString } from '@/utils/dateTime';

describe('dateTime utils', () => {
	describe('normalizeDate', () => {
		it('should return current date ISO string for null or undefined input', () => {
			const beforeNull = new Date().toISOString();
			const resultNull = normalizeDate(null);
			const afterNull = new Date().toISOString();
			expect(new Date(resultNull).getTime()).toBeGreaterThanOrEqual(new Date(beforeNull).getTime());
			expect(new Date(resultNull).getTime()).toBeLessThanOrEqual(new Date(afterNull).getTime());

			const beforeUndefined = new Date().toISOString();
			const resultUndefined = normalizeDate(undefined);
			const afterUndefined = new Date().toISOString();
			expect(new Date(resultUndefined).getTime()).toBeGreaterThanOrEqual(
				new Date(beforeUndefined).getTime()
			);
			expect(new Date(resultUndefined).getTime()).toBeLessThanOrEqual(
				new Date(afterUndefined).getTime()
			);
		});

		it('should convert Date object to ISO string', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = normalizeDate(date);
			expect(result).toBe(date.toISOString());
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});

		it('should convert ISO string to ISO string', () => {
			const isoString = '2024-01-15T10:30:00Z';
			const result = normalizeDate(isoString);
			expect(result).toBe(new Date(isoString).toISOString());
		});

		it('should convert date string to ISO string', () => {
			const dateString = '2024-01-15';
			const result = normalizeDate(dateString);
			expect(new Date(result)).toEqual(new Date(dateString));
		});

		it('should convert various date string formats to ISO', () => {
			const formats = ['01/15/2024', '1/15/2024', '2024/01/15', 'January 15, 2024', '15-01-2024'];

			for (const format of formats) {
				const result = normalizeDate(format);
				expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
				expect(new Date(result)).toBeInstanceOf(Date);
				expect(isNaN(new Date(result).getTime())).toBe(false);
			}
		});

		it('should convert timestamp number to ISO string', () => {
			const timestamp = 1705316400000; // 2024-01-15T10:00:00Z
			const result = normalizeDate(timestamp);
			expect(new Date(result).getTime()).toBe(timestamp);
		});

		it('should handle Unix timestamp (seconds)', () => {
			const unixTimestamp = 1705316400; // in seconds
			const result = normalizeDate(unixTimestamp);
			expect(result).toBeDefined();
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});

		it('should convert object with year, month, day to ISO string', () => {
			const dateObj = { year: 2024, month: 1, day: 15 };
			const expected = new Date(2024, 0, 15, 0, 0, 0).toISOString();
			const result = normalizeDate(dateObj);
			expect(result).toBe(expected);
		});

		it('should convert object with year, month, day, hour, minute, second', () => {
			const dateObj = {
				year: 2024,
				month: 1,
				day: 15,
				hour: 10,
				minute: 30,
				second: 45,
			};
			const expected = new Date(2024, 0, 15, 10, 30, 45).toISOString();
			const result = normalizeDate(dateObj);
			expect(result).toBe(expected);
		});

		it('should handle object with missing time properties (defaults to 0)', () => {
			const dateObj = { year: 2024, month: 3, day: 20 };
			const expected = new Date(2024, 2, 20, 0, 0, 0).toISOString();
			const result = normalizeDate(dateObj);
			expect(result).toBe(expected);
		});

		it('should convert object with string number values', () => {
			const dateObj = { year: '2024', month: '6', day: '10' };
			const expected = new Date(2024, 5, 10, 0, 0, 0).toISOString();
			const result = normalizeDate(dateObj);
			expect(result).toBe(expected);
		});

		it('should return current date for invalid object', () => {
			const invalidObj = { foo: 'bar', baz: 123 };
			const result = normalizeDate(invalidObj);
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});

		it('should return current date for invalid date values', () => {
			expect(normalizeDate('not-a-date')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
			expect(normalizeDate(NaN)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
			expect(normalizeDate({})).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});

		it('should handle leap year dates', () => {
			const leapYearDate = { year: 2024, month: 2, day: 29 };
			const expected = new Date(2024, 1, 29, 0, 0, 0).toISOString();
			const result = normalizeDate(leapYearDate);
			expect(result).toBe(expected);
		});

		it('should handle end of month dates', () => {
			const endOfMonth = { year: 2024, month: 4, day: 30 };
			const expected = new Date(2024, 3, 30, 0, 0, 0).toISOString();
			const result = normalizeDate(endOfMonth);
			expect(result).toBe(expected);
		});

		it('should consistently produce valid ISO format', () => {
			const inputs = [new Date(), '2024-01-15', 1705316400000, { year: 2024, month: 1, day: 15 }];

			for (const input of inputs) {
				const result = normalizeDate(input);
				expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
				expect(new Date(result).getTime()).not.toBeNaN();
			}
		});
	});

	describe('toLocalISOString', () => {
		it('should convert UTC ISO string to local ISO format', () => {
			const utcString = '2024-01-15T10:30:00Z';
			const result = toLocalISOString(utcString);

			// Result should be ISO-like format without Z suffix
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
			expect(result).not.toContain('Z');
		});

		it('should convert Date object to local ISO format', () => {
			const date = new Date('2024-01-15T10:30:00Z');
			const result = toLocalISOString(date);

			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
			expect(result).not.toContain('Z');
		});

		it('should preserve the UTC moment but display in local time', () => {
			// Create a UTC moment
			const utcDate = new Date('2024-01-15T10:30:00Z');
			const result = toLocalISOString(utcDate);

			// The displayed hour should be adjusted by timezone offset
			const offset = utcDate.getTimezoneOffset();
			const expectedHour = utcDate.getUTCHours() - Math.floor(offset / 60);
			const resultHour = parseInt(result.substring(11, 13));
			expect(resultHour).toBe(expectedHour);
		});

		it('should handle UTC string with milliseconds', () => {
			const utcString = '2024-01-15T10:30:45.123Z';
			const result = toLocalISOString(utcString);

			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
			expect(result).not.toContain('Z');
			expect(result).not.toContain('.');
		});

		it('should return current date ISO format for invalid input', () => {
			const result = toLocalISOString('invalid-date');

			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
			expect(result).not.toContain('Z');
		});

		it('should handle UTC midnight', () => {
			const utcMidnight = '2024-01-15T00:00:00Z';
			const result = toLocalISOString(utcMidnight);

			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
			expect(result.startsWith('2024-01-15')).toBe(true);
		});

		it('should handle UTC end of day', () => {
			const utcEndOfDay = '2024-01-15T23:59:59Z';
			const result = toLocalISOString(utcEndOfDay);

			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
		});

		it('should format with leading zeros for single digit time components', () => {
			// Create a date that will have single-digit hours/minutes when localized
			const utcDate = new Date('2024-01-15T01:05:09Z');
			const result = toLocalISOString(utcDate);

			// Should have proper zero-padding
			expect(result).toMatch(/\d{2}:\d{2}:\d{2}$/);
		});

		it('should handle leap year dates', () => {
			const leapYearDate = new Date('2024-02-29T12:00:00Z');
			const result = toLocalISOString(leapYearDate);

			expect(result).toMatch(/^\d{4}-02-29T\d{2}:\d{2}:\d{2}$/);
		});
	});
});
