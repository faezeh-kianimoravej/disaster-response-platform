import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getBase64FromImagePath } from '@/utils/imageUtils';

// Mock FileReader behavior
class MockFileReader {
	onloadend: null | (() => void) = null;
	onerror: null | (() => void) = null;
	result: string | ArrayBuffer | null = null;
	readAsDataURL(_blob: Blob): void {
		void _blob;
		// Simulate turning blob into data URL
		this.result = 'data:image/png;base64,QUJDRA=='; // "ABCD" in base64
		setTimeout(() => {
			if (this.onloadend) this.onloadend();
		}, 0);
	}
}

// Minimal fetch/Response mock
function createFetch(ok = true) {
	return vi.fn().mockResolvedValue({
		ok,
		blob: vi.fn().mockResolvedValue(new Blob(['test'])),
	}) as unknown as typeof fetch;
}

const originalFetch = globalThis.fetch as typeof fetch;
const originalFileReader = (globalThis as unknown as { FileReader: typeof FileReader }).FileReader;

describe('imageUtils.getBase64FromImagePath', () => {
	beforeEach(() => {
		(globalThis as unknown as { FileReader: typeof FileReader }).FileReader =
			MockFileReader as unknown as typeof FileReader;
	});
	afterEach(() => {
		(globalThis as unknown as { fetch: typeof fetch }).fetch = originalFetch as typeof fetch;
		(globalThis as unknown as { FileReader: typeof FileReader }).FileReader = originalFileReader;
		vi.restoreAllMocks();
	});

	it('returns base64 string from fetched blob', async () => {
		(globalThis as unknown as { fetch: typeof fetch }).fetch = createFetch(true);

		const result = await getBase64FromImagePath('/some/path.png');
		expect(result).toBe('QUJDRA==');
		// Verify fetch called with path
		expect(globalThis.fetch).toHaveBeenCalledWith('/some/path.png');
	});

	it('returns empty string if reader yields empty', async () => {
		// Override FileReader to yield null
		class EmptyReader extends MockFileReader {
			override readAsDataURL(_blob: Blob): void {
				void _blob;
				this.result = null;
				setTimeout(() => {
					if (this.onloadend) this.onloadend();
				}, 0);
			}
		}
		(globalThis as unknown as { FileReader: typeof FileReader }).FileReader =
			EmptyReader as unknown as typeof FileReader;
		(globalThis as unknown as { fetch: typeof fetch }).fetch = createFetch(true);

		const result = await getBase64FromImagePath('/another.png');
		expect(result).toBe('');
	});
});
