import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, createTestQueryClient } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { useResource, useResources } from '@/hooks/useResource';

vi.mock('@/api/resource', () => ({
	getResourcesByDepartmentId: vi.fn(async () => [
		{
			resourceId: 21,
			name: 'Truck',
			description: 'Big truck',
			quantity: 2,
			available: 1,
			image: null,
			departmentId: 7,
			resourceType: 'VEHICLE',
		},
	]),
	getResourceById: vi.fn(async (id: number) => ({
		resourceId: id,
		name: 'Truck',
		description: 'Big truck',
		quantity: 2,
		available: 1,
		image: null,
		departmentId: 7,
		resourceType: 'VEHICLE',
	})),
	addResource: vi.fn(),
	updateResource: vi.fn(),
	deleteResource: vi.fn(),
}));

function ListHarness({ departmentId }: { departmentId?: number }) {
	const { resources, loading, error } = useResources(departmentId, { enabled: !!departmentId });
	return (
		<div>
			<div>count:{resources.length}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
			{resources[0] && <div>first:{resources[0].name}</div>}
		</div>
	);
}

function SingleHarness({ id }: { id?: number }) {
	const { resource, loading, error } = useResource(id, { enabled: !!id });
	return (
		<div>
			<div>name:{resource?.name ?? 'none'}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
		</div>
	);
}

describe('useResource', () => {
	it('lists resources for a department', async () => {
		const client = createTestQueryClient();
		renderWithProviders(<ListHarness departmentId={7} />, { queryClient: client });
		await waitFor(() => screen.getByText(/count:1/));
		expect(screen.getByText(/first:Truck/)).toBeInTheDocument();
	});

	it('fetches a single resource by id', async () => {
		renderWithProviders(<SingleHarness id={21} />);
		await waitFor(() => screen.getByText(/name:Truck/));
		expect(screen.getByText(/loading:n/)).toBeInTheDocument();
	});

	it('should not fetch without departmentId', async () => {
		renderWithProviders(<ListHarness />);
		expect(screen.getByText(/count:0/)).toBeInTheDocument();
	});

	it('should not fetch single resource without id', async () => {
		renderWithProviders(<SingleHarness />);
		expect(screen.getByText(/name:none/)).toBeInTheDocument();
	});
});
