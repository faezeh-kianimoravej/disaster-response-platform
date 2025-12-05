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
