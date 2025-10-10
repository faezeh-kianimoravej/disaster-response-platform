import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FormInput, { createOptionsFromObject } from '../components/FormInput';
import { createValidationRule } from '../utils/validation';

describe('FormInput component', () => {
	const defaultProps = {
		label: 'Test Field',
		name: 'testField',
		value: '',
		onChange: vi.fn(),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('basic rendering', () => {
		it('should render text input by default', () => {
			render(<FormInput {...defaultProps} />);

			expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});

		it('should render label correctly', () => {
			render(<FormInput {...defaultProps} label="Custom Label" />);

			expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
		});

		it('should show required asterisk when required is true', () => {
			render(<FormInput {...defaultProps} required />);

			expect(screen.getByText('*')).toBeInTheDocument();
		});

		it('should not show required asterisk when required is false', () => {
			render(<FormInput {...defaultProps} required={false} />);

			expect(screen.queryByText('*')).not.toBeInTheDocument();
		});
	});

	describe('input types', () => {
		it('should render number input', () => {
			render(<FormInput {...defaultProps} type="number" value={42} />);

			const input = screen.getByRole('spinbutton');
			expect(input).toBeInTheDocument();
			expect(input).toHaveAttribute('type', 'number');
		});

		it('should render textarea', () => {
			render(<FormInput {...defaultProps} type="textarea" />);

			expect(screen.getByRole('textbox')).toBeInTheDocument();
			expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
		});

		it('should render select with options', () => {
			const options = [
				{ value: 'option1', label: 'Option 1' },
				{ value: 'option2', label: 'Option 2' },
			];

			render(<FormInput {...defaultProps} type="select" options={options} />);

			const select = screen.getByRole('combobox');
			expect(select).toBeInTheDocument();
			expect(screen.getByText('Option 1')).toBeInTheDocument();
			expect(screen.getByText('Option 2')).toBeInTheDocument();
		});
	});

	describe('validation display', () => {
		it('should show validation error when showValidation is true and validation fails', () => {
			const validation = createValidationRule(false, 'This field is required');

			render(<FormInput {...defaultProps} validation={validation} showValidation={true} />);

			expect(screen.getByText('This field is required')).toBeInTheDocument();
			expect(screen.getByLabelText('Test Field')).toHaveClass('border-red-500', 'bg-red-50');
		});

		it('should not show validation error when showValidation is false', () => {
			const validation = createValidationRule(false, 'This field is required');

			render(<FormInput {...defaultProps} validation={validation} showValidation={false} />);

			expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
		});

		it('should not show validation error when validation passes', () => {
			const validation = createValidationRule(true, '');

			render(<FormInput {...defaultProps} validation={validation} showValidation={true} />);

			expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
			expect(screen.getByLabelText('Test Field')).not.toHaveClass('border-red-300');
		});

		it('should show help text when provided', () => {
			render(<FormInput {...defaultProps} helpText="This is helpful information" />);

			expect(screen.getByText('This is helpful information')).toBeInTheDocument();
		});
	});

	describe('user interactions', () => {
		it('should call onChange when text input value changes', () => {
			const onChange = vi.fn();
			render(<FormInput {...defaultProps} onChange={onChange} />);

			const input = screen.getByRole('textbox');
			fireEvent.change(input, { target: { value: 'new value' } });

			expect(onChange).toHaveBeenCalledTimes(1);
			const call = onChange.mock.calls[0]?.[0];
			expect(call?.target.name).toBe('testField');
			// The value we see depends on the actual input's controlled value, not the fireEvent mock
			expect(call?.type).toBe('change');
		});

		it('should call onChange when number input value changes', () => {
			const onChange = vi.fn();
			render(<FormInput {...defaultProps} type="number" onChange={onChange} />);

			const input = screen.getByRole('spinbutton');
			fireEvent.change(input, { target: { value: '123' } });

			expect(onChange).toHaveBeenCalledTimes(1);
			const call = onChange.mock.calls[0]?.[0];
			expect(call?.target.name).toBe('testField');
			expect(call?.type).toBe('change');
		});

		it('should call onChange when textarea value changes', () => {
			const onChange = vi.fn();
			render(<FormInput {...defaultProps} type="textarea" onChange={onChange} />);

			const textarea = screen.getByRole('textbox');
			fireEvent.change(textarea, { target: { value: 'multiline\ntext' } });

			expect(onChange).toHaveBeenCalledTimes(1);
			const call = onChange.mock.calls[0]?.[0];
			expect(call?.target.name).toBe('testField');
			expect(call?.type).toBe('change');
		});

		it('should call onChange when select value changes', () => {
			const onChange = vi.fn();
			const options = [
				{ value: 'option1', label: 'Option 1' },
				{ value: 'option2', label: 'Option 2' },
			];

			render(<FormInput {...defaultProps} type="select" options={options} onChange={onChange} />);

			const select = screen.getByRole('combobox');
			fireEvent.change(select, { target: { value: 'option2' } });

			expect(onChange).toHaveBeenCalledTimes(1);
			const call = onChange.mock.calls[0]?.[0];
			expect(call?.target.name).toBe('testField');
			expect(call?.type).toBe('change');
		});
	});

	describe('input attributes', () => {
		it('should set min and max attributes for number inputs', () => {
			render(<FormInput {...defaultProps} type="number" min={0} max={100} />);

			const input = screen.getByRole('spinbutton');
			expect(input).toHaveAttribute('min', '0');
			expect(input).toHaveAttribute('max', '100');
		});

		it('should set placeholder when provided', () => {
			render(<FormInput {...defaultProps} placeholder="Enter text here" />);

			const input = screen.getByRole('textbox');
			expect(input).toHaveAttribute('placeholder', 'Enter text here');
		});
	});

	describe('styling', () => {
		it('should apply error styling when validation fails and showValidation is true', () => {
			const validation = createValidationRule(false, 'Error message');

			render(<FormInput {...defaultProps} validation={validation} showValidation={true} />);

			const input = screen.getByLabelText('Test Field');
			expect(input).toHaveClass(
				'border-red-500',
				'bg-red-50',
				'focus:border-red-500',
				'focus:ring-red-500'
			);
		});

		it('should apply normal styling when validation passes', () => {
			const validation = createValidationRule(true, '');

			render(<FormInput {...defaultProps} validation={validation} showValidation={false} />);

			const input = screen.getByLabelText('Test Field');
			expect(input).toHaveClass('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
		});
	});
});

describe('createOptionsFromObject utility', () => {
	it('should convert object to option array', () => {
		const obj = {
			key1: 'Value 1',
			key2: 'Value 2',
			key3: 'Value 3',
		};

		const result = createOptionsFromObject(obj);

		expect(result).toEqual([
			{ value: 'Value 1', label: 'Value 1' },
			{ value: 'Value 2', label: 'Value 2' },
			{ value: 'Value 3', label: 'Value 3' },
		]);
	});

	it('should handle empty object', () => {
		const result = createOptionsFromObject({});
		expect(result).toEqual([]);
	});
});
