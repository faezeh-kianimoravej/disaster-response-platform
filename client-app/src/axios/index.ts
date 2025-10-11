// Thin wrapper around fetch (keeps import shape similar to axios)
export async function request(url: string, options: RequestInit = {}) {
	const base = import.meta.env.VITE_API_BASE_URL || '';
	const res = await fetch(`${base}${url}`, options);
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Request failed: ${res.status} ${text}`);
	}
	return res.json();
}

export default { request };
