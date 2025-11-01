import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, createTestQueryClient } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { useDepartment, useDepartments } from '@/hooks/useDepartment';

vi.mock('@/api/department', () => ({
	getDepartmentsByMunicipalityId: vi.fn(async () => [
		{ departmentId: 10, name: 'Ops', municipalityId: 7, image: null },
		{ departmentId: 11, name: 'Health', municipalityId: 7, image: 'default.png' },
	]),
	getDepartmentById: vi.fn(async (id: number) => ({
		departmentId: id,
		name: 'Ops',
		municipalityId: 7,
		image: null,
	})),
	addDepartment: vi.fn(),
	updateDepartment: vi.fn(),
	deleteDepartment: vi.fn(),
}));

function ListHarness({ municipalityId }: { municipalityId?: number }) {
	const { departments, loading, error } = useDepartments(municipalityId, {
		enabled: !!municipalityId,
	});
	return (
		<div>
			<div>count:{departments.length}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
			{departments[0] && <div>first:{departments[0].name}</div>}
		</div>
	);
}

function SingleHarness({ id }: { id?: number }) {
	const { department, loading, error } = useDepartment(id, { enabled: !!id });
	return (
		<div>
			<div>name:{department?.name ?? 'none'}</div>
			<div>loading:{loading ? 'y' : 'n'}</div>
			<div>err:{error ? 'y' : 'n'}</div>
		</div>
	);
}

describe('useDepartment', () => {
	it('lists departments for a municipality', async () => {
		const client = createTestQueryClient();
		renderWithProviders(<ListHarness municipalityId={7} />, { queryClient: client });
		await waitFor(() => screen.getByText(/count:2/));
		expect(screen.getByText(/first:Ops/)).toBeInTheDocument();
	});

	it('fetches a single department by id', async () => {
		renderWithProviders(<SingleHarness id={10} />);
		await waitFor(() => screen.getByText(/name:Ops/));
		expect(screen.getByText(/loading:n/)).toBeInTheDocument();
	});
});
