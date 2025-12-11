/**
 * Normalize various date/time formats into ISO 8601 string.
 * Handles: Date, string, number, and objects with year/month/day properties.
 */
export function normalizeDate(input: unknown): string {
	if (!input) return new Date().toISOString();

	if (input instanceof Date) {
		return input.toISOString();
	}

	if (typeof input === 'string') {
		const d = new Date(input);
		if (!isNaN(d.getTime())) return d.toISOString();
	}

	if (typeof input === 'number') {
		const d = new Date(input);
		if (!isNaN(d.getTime())) return d.toISOString();
	}

	if (typeof input === 'object' && input !== null) {
		try {
			const obj = input as Record<string, unknown>;
			if ('year' in obj && 'month' in obj && 'day' in obj) {
				const { year, month, day, hour = 0, minute = 0, second = 0 } = obj;
				const d = new Date(
					Number(year),
					Number(month) - 1,
					Number(day),
					Number(hour),
					Number(minute),
					Number(second)
				);
				if (!isNaN(d.getTime())) return d.toISOString();
			}
		} catch {}
	}

	return new Date().toISOString();
}

/**
 * Convert UTC ISO 8601 timestamp to user's local timezone ISO string.
 * The input is assumed to be UTC (with or without Z suffix).
 * Returns ISO 8601 string with local time components.
 * @param utcTimestamp UTC timestamp (e.g., "2025-12-11T10:30:00Z")
 * @returns ISO-like string with local time (e.g., "2025-12-11T11:30:00")
 */
export function toLocalISOString(utcTimestamp: string | Date): string {
	const date = typeof utcTimestamp === 'string' ? new Date(utcTimestamp) : utcTimestamp;

	// Use current date if invalid input
	const validDate = isNaN(date.getTime()) ? new Date() : date;

	// Format using local time: YYYY-MM-DDTHH:mm:ss
	const year = validDate.getFullYear();
	const month = String(validDate.getMonth() + 1).padStart(2, '0');
	const day = String(validDate.getDate()).padStart(2, '0');
	const hours = String(validDate.getHours()).padStart(2, '0');
	const minutes = String(validDate.getMinutes()).padStart(2, '0');
	const seconds = String(validDate.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
