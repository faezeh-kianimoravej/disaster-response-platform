import { describe, it, expect } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

describe('src/index.tsx file (smoke)', () => {
	it('contains createRoot (sanity check)', async () => {
		const p = path.resolve(__dirname, '..', '..', '..', 'index.tsx');
		const content = await fs.readFile(p, 'utf-8');
		expect(content).toMatch(/createRoot|ReactDOM\.createRoot/);
	});
});
