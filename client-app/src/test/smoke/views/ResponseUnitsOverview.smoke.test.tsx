import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import ResponseUnitsOverview from '@/components/views/ResponseUnitsOverview';
import { screen } from '@testing-library/react';

const mockUseResponseUnits = vi.fn();
const mockShowSingleError = vi.fn();

vi.mock('@/hooks/useResponseUnit', () => ({
	useResponseUnits: (...args: unknown[]) => mockUseResponseUnits(...args),
}));

vi.mock('@/hooks/useSingleErrorToast', () => ({
	__esModule: true,
	default: () => mockShowSingleError,
}));

describe('ResponseUnitsOverview (smoke)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseResponseUnits.mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});
	});

	it('shows loading state', () => {
		mockUseResponseUnits.mockReturnValue({
			data: [],
			isLoading: true,
			error: null,
			refetch: vi.fn(),
		});
		renderWithProviders(<ResponseUnitsOverview departmentId={1} />);
		expect(screen.getByText(/Loading response units/i)).toBeInTheDocument();
	});

	it('shows error retry block when error', () => {
		mockUseResponseUnits.mockReturnValue({
			data: [],
			isLoading: false,
			error: new Error('fail'),
			refetch: vi.fn(),
		});
		renderWithProviders(<ResponseUnitsOverview departmentId={1} />);
		expect(screen.getByText(/Unable to load response units\./i)).toBeInTheDocument();
	});

	it('shows empty state when no units', () => {
		mockUseResponseUnits.mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});
		renderWithProviders(<ResponseUnitsOverview departmentId={1} />);
		expect(screen.getByText(/No response units found\./i)).toBeInTheDocument();
	});

	it('renders unit cards when data present', () => {
		const unit = {
			unitId: 5,
			unitName: 'Alpha 1',
			unitType: 'Ambulance',
			status: 'available',
			defaultPersonnel: [{ id: 1 }],
			defaultResources: [],
			currentPersonnel: [{ id: 2 }],
		};
		mockUseResponseUnits.mockReturnValue({
			data: [unit],
			isLoading: false,
			error: null,
			refetch: vi.fn(),
		});
		renderWithProviders(<ResponseUnitsOverview departmentId={1} />);
		expect(screen.getByText(/Alpha 1/)).toBeInTheDocument();
		expect(screen.getByText(/Ambulance/)).toBeInTheDocument();
		expect(screen.getByText(/Personnel \(default\):/i)).toBeInTheDocument();
	});
});
