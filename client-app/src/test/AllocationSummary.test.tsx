import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AllocationSummary from '@/components/AllocationSummary';

describe('AllocationSummary', () => {
	const mockResourceTypesMap = {
		'1': 'Ambulance',
		'2': 'Fire Truck',
		'3': 'Police Car',
	};

	const mockAllocationQuantities = {
		'1': 2,
		'2': 1,
		'3': 3,
	};

	it('renders allocation summary in read-only mode by default', () => {
		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
			/>
		);

		expect(screen.getByText('Allocation Summary')).toBeInTheDocument();
		expect(screen.getByText('Ambulance')).toBeInTheDocument();
		expect(screen.getByText('Fire Truck')).toBeInTheDocument();
		expect(screen.getByText('Police Car')).toBeInTheDocument();

		// Check quantities are displayed as text, not inputs
		expect(screen.getByText('2')).toBeInTheDocument();
		expect(screen.getByText('1')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();

		// Should not have edit inputs or delete buttons in read-only mode
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
		expect(screen.queryByTitle('Delete resource')).not.toBeInTheDocument();
		expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
	});

	it('renders allocation summary in editable mode', () => {
		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
			/>
		);

		// Should have input fields for quantities
		const inputs = screen.getAllByRole('spinbutton');
		expect(inputs).toHaveLength(3);

		// Should have delete buttons for each resource
		const deleteButtons = screen.getAllByTitle('Delete resource');
		expect(deleteButtons).toHaveLength(3);

		// Check input values
		expect(inputs[0]).toHaveValue(2);
		expect(inputs[1]).toHaveValue(1);
		expect(inputs[2]).toHaveValue(3);
	});

	it('shows "No resources allocated" when quantities are empty', () => {
		render(
			<AllocationSummary
				allocationQuantities={{}}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
			/>
		);

		expect(screen.getByText('No resources allocated.')).toBeInTheDocument();
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
		expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
	});

	it('calls onChange when quantity is edited', async () => {
		const onChangeMock = vi.fn();

		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
				onChange={onChangeMock}
			/>
		);

		const inputs = screen.getAllByRole('spinbutton');

		// Change the first resource quantity from 2 to 5
		fireEvent.change(inputs[0]!, { target: { value: '5' } });

		expect(onChangeMock).toHaveBeenCalledWith({
			'1': 5,
			'2': 1,
			'3': 3,
		});
	});

	it('calls onChange when resource is deleted', async () => {
		const onChangeMock = vi.fn();

		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
				onChange={onChangeMock}
			/>
		);

		const deleteButtons = screen.getAllByTitle('Delete resource');

		// Delete the first resource (Ambulance)
		fireEvent.click(deleteButtons[0]!);

		expect(onChangeMock).toHaveBeenCalledWith({
			'2': 1,
			'3': 3,
		});
	});

	it('shows Save Changes button when changes are made', async () => {
		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
			/>
		);

		// Initially no Save button should be visible
		expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();

		// Make a change
		const inputs = screen.getAllByRole('spinbutton');
		fireEvent.change(inputs[0]!, { target: { value: '5' } });

		// Save button should now appear
		await waitFor(() => {
			expect(screen.getByText('Save Changes')).toBeInTheDocument();
		});
	});

	it('calls onSave when Save Changes button is clicked', async () => {
		const onSaveMock = vi.fn();

		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
				onSave={onSaveMock}
			/>
		);

		// Make a change to trigger the Save button
		const inputs = screen.getAllByRole('spinbutton');
		fireEvent.change(inputs[0]!, { target: { value: '5' } });

		// Wait for Save button to appear and click it
		await waitFor(() => {
			expect(screen.getByText('Save Changes')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByText('Save Changes'));

		expect(onSaveMock).toHaveBeenCalledWith({
			'1': 5,
			'2': 1,
			'3': 3,
		});
	});

	it('hides Save Changes button after saving', async () => {
		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
			/>
		);

		// Make a change
		const inputs = screen.getAllByRole('spinbutton');
		fireEvent.change(inputs[0]!, { target: { value: '5' } });

		// Save button appears
		await waitFor(() => {
			expect(screen.getByText('Save Changes')).toBeInTheDocument();
		});

		// Click save
		fireEvent.click(screen.getByText('Save Changes'));

		// Save button should disappear
		await waitFor(() => {
			expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
		});
	});

	it('handles zero and negative quantities correctly', async () => {
		const onChangeMock = vi.fn();

		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
				onChange={onChangeMock}
			/>
		);

		const inputs = screen.getAllByRole('spinbutton');

		// Try to set negative quantity - should be converted to 0
		fireEvent.change(inputs[0]!, { target: { value: '-5' } });

		expect(onChangeMock).toHaveBeenCalledWith({
			'1': 0,
			'2': 1,
			'3': 3,
		});
	});

	it('displays fallback resource names when resourceTypesMap is not provided', () => {
		render(<AllocationSummary allocationQuantities={mockAllocationQuantities} editable={true} />);

		expect(screen.getByText('Resource 1')).toBeInTheDocument();
		expect(screen.getByText('Resource 2')).toBeInTheDocument();
		expect(screen.getByText('Resource 3')).toBeInTheDocument();
	});

	it('keeps resources visible when quantity is set to 0 in editable mode', () => {
		const onChangeMock = vi.fn();

		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
				onChange={onChangeMock}
			/>
		);

		const inputs = screen.getAllByRole('spinbutton');

		// Set quantity to 0 - should keep the resource visible in editable mode
		fireEvent.change(inputs[0]!, { target: { value: '0' } });

		// Resource should still be visible
		expect(screen.getByText('Ambulance')).toBeInTheDocument();

		// onChange should be called with 0 quantity, not removed
		expect(onChangeMock).toHaveBeenCalledWith({
			'1': 0,
			'2': 1,
			'3': 3,
		});
	});

	it('handles empty input values during typing without removing resource', () => {
		const onChangeMock = vi.fn();

		render(
			<AllocationSummary
				allocationQuantities={mockAllocationQuantities}
				resourceTypesMap={mockResourceTypesMap}
				editable={true}
				onChange={onChangeMock}
			/>
		);

		const inputs = screen.getAllByRole('spinbutton');

		// Simulate clearing the input (empty string) - should not remove the resource
		fireEvent.change(inputs[0]!, { target: { value: '' } });

		// Resource should still be visible
		expect(screen.getByText('Ambulance')).toBeInTheDocument();

		// onChange should be called with 0 quantity for empty input
		expect(onChangeMock).toHaveBeenCalledWith({
			'1': 0,
			'2': 1,
			'3': 3,
		});
	});

	it('hides resources with 0 quantity in read-only mode', () => {
		const quantitiesWithZero = {
			'1': 0, // This should be hidden in read-only mode
			'2': 1,
			'3': 3,
		};

		render(
			<AllocationSummary
				allocationQuantities={quantitiesWithZero}
				resourceTypesMap={mockResourceTypesMap}
				editable={false}
			/>
		);

		// Should not show the resource with 0 quantity in read-only mode
		expect(screen.queryByText('Ambulance')).not.toBeInTheDocument();
		
		// Should still show resources with positive quantities
		expect(screen.getByText('Fire Truck')).toBeInTheDocument();
		expect(screen.getByText('Police Car')).toBeInTheDocument();
	});
});
