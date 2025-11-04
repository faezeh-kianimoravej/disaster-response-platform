import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, createTestQueryClient } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { useMunicipality, useMunicipalities } from '@/hooks/useMunicipality';

vi.mock('@/api/municipality', () => ({
	getMunicipalitiesByRegionId: vi.fn(async () => [
		{ municipalityId: 5, name: 'Muni X', regionId: 1 },
		{ municipalityId: 6, name: 'Muni Y', regionId: 1 },
	]),
	getMunicipalityById: vi.fn(async (id: number) => ({
		municipalityId: id,
		name: 'Muni X',
		regionId: 1,
	})),
}));

function ListHarness({ regionId }: { regionId?: number }) {
	const { municipalities, loading, error } = useMunicipalities(regionId, {
		enabled: !!regionId,
	});
	return (
		<div>
			<div>count:{municipalities.length}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
			{municipalities[0] && <div>first:{municipalities[0].name}</div>}
		</div>
	);
}

function SingleHarness({ id }: { id?: number }) {
	const { municipality, loading, error } = useMunicipality(id, 1);
	return (
		<div>
			<div>name:{municipality?.name ?? 'none'}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
		</div>
	);
}

describe('useMunicipality', () => {
	it('lists municipalities for a region', async () => {
		const client = createTestQueryClient();
		renderWithProviders(<ListHarness regionId={1} />, { queryClient: client });
		await waitFor(() => screen.getByText(/count:2/));
		expect(screen.getByText(/first:Muni X/)).toBeInTheDocument();
	});

	it('fetches a single municipality by id', async () => {
		renderWithProviders(<SingleHarness id={5} />);
		await waitFor(() => screen.getByText(/name:Muni X/));
		expect(screen.getByText(/loading:n/)).toBeInTheDocument();
	});
});
