import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResourceForm from '../components/ResourceForm';
import { ToastProvider } from '../components/ToastProvider';
import type { Resource } from '../data/resources';

// Mock the image import issue that might occur in tests
vi.mock('../assets', () => ({}));

// Helper function to render component with ToastProvider
const renderWithToast = (component: React.ReactElement) => {
	return render(<ToastProvider>{component}</ToastProvider>);
};

describe('ResourceForm component', () => {
	const mockOnSave = vi.fn();
	const mockOnCancel = vi.fn();
	const mockOnImageChange = vi.fn();

	const defaultProps = {
		isNewResource: true,
		onSave: mockOnSave,
		onCancel: mockOnCancel,
		onImageChange: mockOnImageChange,
	};

	const existingResource: Partial<Resource> = {
		resourceId: 1,
		name: 'Test Resource',
		description: 'Test description',
		quantity: 10,
		available: 5,
		resourceType: 'Medical',
		departmentId: 101,
		image: '/images/medical.png',
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('form rendering', () => {
		it('should render all form fields for new resource', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
			expect(screen.getByLabelText('Description')).toBeInTheDocument();
			expect(screen.getByLabelText('Resource Type')).toBeInTheDocument();
			expect(screen.getByLabelText('Department ID')).toBeInTheDocument();
			expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
			expect(screen.getByLabelText('Available')).toBeInTheDocument();
		});

		it('should render Create button for new resource', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
		});

		it('should render Save button for existing resource', () => {
			renderWithToast(
				<ResourceForm {...defaultProps} isNewResource={false} initialData={existingResource} />
			);

			expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
		});

		it('should render Cancel button', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
		});

		it('should show required asterisks only on required fields', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			// Required fields should have asterisks
			expect(screen.getByText('Name')).toBeInTheDocument();
			expect(screen.getAllByText('*')).toHaveLength(1); // Only name should be required
		});
	});

	describe('form initialization', () => {
		it('should initialize with empty values for new resource', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const nameInput = screen.getByLabelText(/^Name/);
			const quantityInput = screen.getByLabelText('Quantity');

			expect(nameInput).toHaveValue('');
			expect(quantityInput).toHaveValue(0);
		});

		it('should initialize with existing data when editing', () => {
			renderWithToast(
				<ResourceForm {...defaultProps} isNewResource={false} initialData={existingResource} />
			);

			expect(screen.getByDisplayValue('Test Resource')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
			expect(screen.getByDisplayValue('10')).toBeInTheDocument();
			expect(screen.getByDisplayValue('5')).toBeInTheDocument();
			expect(screen.getByDisplayValue('101')).toBeInTheDocument();
		});

		it('should set default resource type to Medical', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const select = screen.getByDisplayValue('Medical');
			expect(select).toBeInTheDocument();
		});
	});

	describe('form validation', () => {
		it('should show validation error for empty required name', async () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const submitButton = screen.getByRole('button', { name: 'Create' });

			// Try to submit with empty name
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Resource name is required')).toBeInTheDocument();
			});
		});

		it('should show validation error for invalid quantity', async () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const nameInput = screen.getByLabelText(/^Name/);
			const quantityInput = screen.getByLabelText('Quantity');

			// Set valid name but invalid quantity (0)
			fireEvent.change(nameInput, { target: { value: 'Test Resource' } });
			fireEvent.change(quantityInput, { target: { value: '0' } });

			// Trigger validation by trying to submit
			const submitButton = screen.getByRole('button', { name: 'Create' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(screen.getByText('Quantity must be at least 1')).toBeInTheDocument();
			});
		});

		it('should disable submit button when form is invalid', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const submitButton = screen.getByRole('button', { name: 'Create' });
			expect(submitButton).toHaveClass('bg-gray-300'); // disabled styling
		});

		it('should enable submit button when form is valid', async () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const nameInput = screen.getByLabelText(/^Name/);
			const quantityInput = screen.getByLabelText('Quantity');

			fireEvent.change(nameInput, { target: { value: 'Valid Resource' } });
			fireEvent.change(quantityInput, { target: { value: '5' } });

			await waitFor(() => {
				const submitButton = screen.getByRole('button', { name: 'Create' });
				expect(submitButton).toHaveClass('bg-green-600'); // enabled styling
			});
		});
	});

	describe('form interactions', () => {
		it('should update form values when user types', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const nameInput = screen.getByLabelText(/^Name/);
			fireEvent.change(nameInput, { target: { value: 'New Name' } });

			expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
		});

		it('should update image when resource type changes', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const resourceTypeSelect = screen.getByLabelText('Resource Type');
			fireEvent.change(resourceTypeSelect, { target: { value: 'Vehicle' } });

			// The component should call onImageChange with the vehicle image
			expect(mockOnImageChange).toHaveBeenCalledWith('/images/ambulance.png');
		});

		it('should call onCancel when Cancel button is clicked', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const cancelButton = screen.getByRole('button', { name: 'Cancel' });
			fireEvent.click(cancelButton);

			expect(mockOnCancel).toHaveBeenCalledTimes(1);
		});

		it('should call onSave with form data when valid form is submitted', async () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			// Fill in required fields
			const nameInput = screen.getByLabelText(/^Name/);
			const quantityInput = screen.getByLabelText('Quantity');
			const availableInput = screen.getByLabelText('Available');

			fireEvent.change(nameInput, { target: { value: 'Test Resource' } });
			fireEvent.change(quantityInput, { target: { value: '10' } });
			fireEvent.change(availableInput, { target: { value: '5' } });

			// Submit the form
			const submitButton = screen.getByRole('button', { name: 'Create' });
			fireEvent.click(submitButton);

			await waitFor(() => {
				expect(mockOnSave).toHaveBeenCalledWith(
					expect.objectContaining({
						name: 'Test Resource',
						quantity: 10,
						available: 5,
						resourceType: 'Medical',
						departmentId: 101,
					})
				);
			});
		});

		it('should not call onSave when invalid form is submitted', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			// Submit without filling required fields
			const submitButton = screen.getByRole('button', { name: 'Create' });
			fireEvent.click(submitButton);

			expect(mockOnSave).not.toHaveBeenCalled();
		});
	});

	describe('help text and field information', () => {
		it('should show help text for available field', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			expect(screen.getByText('Maximum: 0')).toBeInTheDocument();
		});

		it('should update available field help text when quantity changes', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			const quantityInput = screen.getByLabelText('Quantity');
			fireEvent.change(quantityInput, { target: { value: '20' } });

			expect(screen.getByText('Maximum: 20')).toBeInTheDocument();
		});
	});

	describe('accessibility', () => {
		it('should have proper labels for all form controls', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
			expect(screen.getByLabelText('Description')).toBeInTheDocument();
			expect(screen.getByLabelText('Resource Type')).toBeInTheDocument();
			expect(screen.getByLabelText('Department ID')).toBeInTheDocument();
			expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
			expect(screen.getByLabelText('Available')).toBeInTheDocument();
		});

		it('should have proper button roles', () => {
			renderWithToast(<ResourceForm {...defaultProps} />);

			expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
		});
	});
});
