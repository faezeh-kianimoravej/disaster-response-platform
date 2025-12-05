export function formatRelativeTime(iso?: string): string {
	if (!iso) return '';
	try {
		const d = new Date(iso);
		const now = Date.now();
		const diffMs = now - d.getTime();
		const diffSec = Math.floor(diffMs / 1000);
		const diffMin = Math.floor(diffSec / 60);
		const diffHour = Math.floor(diffMin / 60);

		if (diffSec < 60) return 'just now';
		if (diffMin < 60) return `${diffMin}m`;
		if (diffHour < 24) return `${diffHour}h`;

		// check for yesterday by date difference in local timezone
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		if (
			d.getFullYear() === yesterday.getFullYear() &&
			d.getMonth() === yesterday.getMonth() &&
			d.getDate() === yesterday.getDate()
		) {
			return 'Yesterday';
		}

		// show day+month for same year, otherwise include year
		const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
		if (d.getFullYear() !== today.getFullYear()) opts.year = 'numeric';
		return d.toLocaleDateString(undefined, opts);
	} catch {
		return '';
	}
}
