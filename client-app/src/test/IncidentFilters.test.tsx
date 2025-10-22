import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IncidentFilters from '../components/IncidentFilters';

describe('IncidentFilters component', () => {
	const mockProps = {
		statusFilter: '',
		priorityFilter: '',
		gripFilter: '',
		timeFilter: '',
		searchQuery: '',
		onStatusChange: vi.fn(),
		onPriorityChange: vi.fn(),
		onGripChange: vi.fn(),
		onTimeChange: vi.fn(),
		onSearchChange: vi.fn(),
		onClearAll: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('rendering', () => {
		it('should render all filter inputs', () => {
			render(<IncidentFilters {...mockProps} />);

			const selects = screen.getAllByRole('combobox');
			expect(selects).toHaveLength(4); // status, priority, grip, time
			expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
		});

		it('should not show active filters section when no filters are active', () => {
			render(<IncidentFilters {...mockProps} />);

			expect(screen.queryByText('Active filters:')).not.toBeInTheDocument();
			expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
		});

		it('should show active filters section when at least one filter is active', () => {
			render(<IncidentFilters {...mockProps} statusFilter="Open" />);

			expect(screen.getByText('Active filters:')).toBeInTheDocument();
			expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
		});
	});

	describe('filter changes', () => {
		it('should call onStatusChange when status filter changes', () => {
			render(<IncidentFilters {...mockProps} />);

			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
			fireEvent.change(statusSelect, { target: { value: 'Open' } });

			expect(mockProps.onStatusChange).toHaveBeenCalledWith('Open');
		});

		it('should call onPriorityChange when priority filter changes', () => {
			render(<IncidentFilters {...mockProps} />);

			const prioritySelect = document.querySelector('select[name="priority"]') as HTMLSelectElement;
			fireEvent.change(prioritySelect, { target: { value: 'High' } });

			expect(mockProps.onPriorityChange).toHaveBeenCalledWith('High');
		});

		it('should call onGripChange when GRIP filter changes', () => {
			render(<IncidentFilters {...mockProps} />);

			const gripSelect = document.querySelector('select[name="grip"]') as HTMLSelectElement;
			fireEvent.change(gripSelect, { target: { value: '3' } });

			expect(mockProps.onGripChange).toHaveBeenCalledWith('3');
		});

		it('should call onTimeChange when time filter changes', () => {
			render(<IncidentFilters {...mockProps} />);

			const timeSelect = document.querySelector('select[name="time"]') as HTMLSelectElement;
			fireEvent.change(timeSelect, { target: { value: 'last15' } });

			expect(mockProps.onTimeChange).toHaveBeenCalledWith('last15');
		});

		it('should call onSearchChange when search input changes', () => {
			render(<IncidentFilters {...mockProps} />);

			const searchInput = screen.getByPlaceholderText('Search');
			fireEvent.change(searchInput, { target: { value: 'fire' } });

			expect(mockProps.onSearchChange).toHaveBeenCalledWith('fire');
		});
	});

	describe('active filter pills', () => {
		it('should display status filter pill when status is active', () => {
			render(<IncidentFilters {...mockProps} statusFilter="Open" />);

			expect(screen.getByText(/Status: Open/)).toBeInTheDocument();
		});

		it('should display priority filter pill when priority is active', () => {
			render(<IncidentFilters {...mockProps} priorityFilter="High" />);

			expect(screen.getByText(/Priority: High/)).toBeInTheDocument();
		});

		it('should display GRIP filter pill when GRIP is active', () => {
			render(<IncidentFilters {...mockProps} gripFilter="3" />);

			expect(screen.getByText(/GRIP: 3/)).toBeInTheDocument();
		});

		it('should display time filter pill with label when time is active', () => {
			render(<IncidentFilters {...mockProps} timeFilter="last15" />);

			expect(screen.getByText(/Time: Last 15 min/)).toBeInTheDocument();
		});

		it('should display search filter pill when search is active', () => {
			render(<IncidentFilters {...mockProps} searchQuery="fire" />);

			expect(screen.getByText(/Search: "fire"/)).toBeInTheDocument();
		});

		it('should display all active filter pills simultaneously', () => {
			render(
				<IncidentFilters
					{...mockProps}
					statusFilter="Open"
					priorityFilter="High"
					gripFilter="3"
					timeFilter="last1h"
					searchQuery="fire"
				/>
			);

			expect(screen.getByText(/Status: Open/)).toBeInTheDocument();
			expect(screen.getByText(/Priority: High/)).toBeInTheDocument();
			expect(screen.getByText(/GRIP: 3/)).toBeInTheDocument();
			expect(screen.getByText(/Time: Last hour/)).toBeInTheDocument();
			expect(screen.getByText(/Search: "fire"/)).toBeInTheDocument();
		});
	});

	describe('removing individual filters', () => {
		it('should call onStatusChange with empty string when removing status pill', () => {
			render(<IncidentFilters {...mockProps} statusFilter="Open" />);

			const removeButton = screen.getByLabelText('Remove status filter');
			fireEvent.click(removeButton);

			expect(mockProps.onStatusChange).toHaveBeenCalledWith('');
		});

		it('should call onPriorityChange with empty string when removing priority pill', () => {
			render(<IncidentFilters {...mockProps} priorityFilter="High" />);

			const removeButton = screen.getByLabelText('Remove priority filter');
			fireEvent.click(removeButton);

			expect(mockProps.onPriorityChange).toHaveBeenCalledWith('');
		});

		it('should call onGripChange with empty string when removing GRIP pill', () => {
			render(<IncidentFilters {...mockProps} gripFilter="3" />);

			const removeButton = screen.getByLabelText('Remove GRIP filter');
			fireEvent.click(removeButton);

			expect(mockProps.onGripChange).toHaveBeenCalledWith('');
		});

		it('should call onTimeChange with empty string when removing time pill', () => {
			render(<IncidentFilters {...mockProps} timeFilter="last15" />);

			const removeButton = screen.getByLabelText('Remove time filter');
			fireEvent.click(removeButton);

			expect(mockProps.onTimeChange).toHaveBeenCalledWith('');
		});

		it('should call onSearchChange with empty string when removing search pill', () => {
			render(<IncidentFilters {...mockProps} searchQuery="fire" />);

			const removeButton = screen.getByLabelText('Remove search filter');
			fireEvent.click(removeButton);

			expect(mockProps.onSearchChange).toHaveBeenCalledWith('');
		});
	});

	describe('Clear All Filters button', () => {
		it('should call onClearAll when clicked', () => {
			render(<IncidentFilters {...mockProps} statusFilter="Open" />);

			const clearButton = screen.getByText('Clear All Filters');
			fireEvent.click(clearButton);

			expect(mockProps.onClearAll).toHaveBeenCalledTimes(1);
		});

		it('should not be visible when no filters are active', () => {
			render(<IncidentFilters {...mockProps} />);

			expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
		});

		it('should be visible when any filter is active', () => {
			render(<IncidentFilters {...mockProps} searchQuery="test" />);

			expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
		});
	});

	describe('active state styling', () => {
		it('should mark status input as active when status filter is set', () => {
			render(<IncidentFilters {...mockProps} statusFilter="Open" />);

			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
			expect(statusSelect).toHaveClass('border-blue-500');
		});

		it('should mark priority input as active when priority filter is set', () => {
			render(<IncidentFilters {...mockProps} priorityFilter="High" />);

			const prioritySelect = document.querySelector('select[name="priority"]') as HTMLSelectElement;
			expect(prioritySelect).toHaveClass('border-blue-500');
		});

		it('should mark GRIP input as active when GRIP filter is set', () => {
			render(<IncidentFilters {...mockProps} gripFilter="3" />);

			const gripSelect = document.querySelector('select[name="grip"]') as HTMLSelectElement;
			expect(gripSelect).toHaveClass('border-blue-500');
		});

		it('should mark time input as active when time filter is set', () => {
			render(<IncidentFilters {...mockProps} timeFilter="last15" />);

			const timeSelect = document.querySelector('select[name="time"]') as HTMLSelectElement;
			expect(timeSelect).toHaveClass('border-blue-500');
		});

		it('should mark search input as active when search query is set', () => {
			render(<IncidentFilters {...mockProps} searchQuery="fire" />);

			const searchInput = screen.getByPlaceholderText('Search');
			expect(searchInput).toHaveClass('border-blue-500');
		});

		it('should not mark inputs as active when filters are empty', () => {
			render(<IncidentFilters {...mockProps} />);

			const statusSelect = document.querySelector('select[name="status"]') as HTMLSelectElement;
			const prioritySelect = document.querySelector('select[name="priority"]') as HTMLSelectElement;

			expect(statusSelect).not.toHaveClass('border-blue-500');
			expect(prioritySelect).not.toHaveClass('border-blue-500');
		});
	});
});
