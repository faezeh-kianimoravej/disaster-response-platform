import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, createTestQueryClient } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { useRegion, useRegions } from '@/hooks/useRegion';

vi.mock('@/api/region', () => ({
	getRegions: vi.fn(async () => [
		{ regionId: 1, name: 'Region A' },
		{ regionId: 2, name: 'Region B' },
	]),
	getRegionById: vi.fn(async (id: number) => ({
		regionId: id,
		name: 'Region A',
	})),
}));

function ListHarness() {
	const { regions, loading, error } = useRegions({ enabled: true });
	return (
		<div>
			<div>count:{regions.length}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
			{regions[0] && <div>first:{regions[0].name}</div>}
		</div>
	);
}

function SingleHarness({ id }: { id?: number }) {
	const { region, loading, error } = useRegion(id, { enabled: !!id });
	return (
		<div>
			<div>name:{region?.name ?? 'none'}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
		</div>
	);
}

describe('useRegion', () => {
	it('lists regions when enabled', async () => {
		const client = createTestQueryClient();
		renderWithProviders(<ListHarness />, { queryClient: client });
		await waitFor(() => screen.getByText(/count:2/));
		expect(screen.getByText(/first:Region A/)).toBeInTheDocument();
	});

	it('fetches a single region by id', async () => {
		renderWithProviders(<SingleHarness id={1} />);
		await waitFor(() => screen.getByText(/name:Region A/));
		expect(screen.getByText(/loading:n/)).toBeInTheDocument();
	});
});
