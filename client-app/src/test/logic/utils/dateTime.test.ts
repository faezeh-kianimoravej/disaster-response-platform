import { describe, it, expect } from 'vitest';
import { normalizeDate } from '@/utils/dateTime';

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
});
