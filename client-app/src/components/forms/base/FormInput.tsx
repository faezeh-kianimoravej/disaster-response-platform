import { useState } from 'react';

export interface FormInputProps {
	label: string;
	name: string;
	value: string | number;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => void;
	type?: 'text' | 'number' | 'textarea' | 'select' | 'file' | 'password';
	required?: boolean;
	error?: string | undefined;
	showValidation?: boolean;
	placeholder?: string;
	min?: number;
	max?: number;
	options?: Array<{ value: string | number; label: string }>;
	className?: string;
	disabled?: boolean;
	helpText?: string;
	isActive?: boolean;
	accept?: string;
	showPreview?: boolean;
	previewClassName?: string;
}

export default function FormInput({
	label,
	name,
	value,
	onChange,
	type = 'text',
	required = false,
	error,
	showValidation = false,
	placeholder,
	min,
	max,
	options = [],
	className = '',
	disabled = false,
	helpText,
	isActive = false,
	accept,
	showPreview = false,
	previewClassName = 'h-32 w-32 object-cover border rounded-md',
}: FormInputProps) {
	const hasError = Boolean(showValidation && error);
	const inputId = `${name}-input`;

	const baseClasses = `mt-1 block w-full border rounded p-2 ${
		hasError
			? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500'
			: isActive
				? 'border-blue-500 border-2 focus:border-blue-600 focus:ring-blue-500'
				: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
	} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`;

	const [previewSrc, setPreviewSrc] = useState<string | null>(null);

	const renderInput = () => {
		switch (type) {
			case 'textarea':
				return (
					<textarea
						id={inputId}
						name={name}
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						disabled={disabled}
						className={baseClasses}
						rows={3}
					/>
				);

			case 'select':
				return (
					<select
						id={inputId}
						name={name}
						value={value}
						onChange={onChange}
						disabled={disabled}
						className={baseClasses}
					>
						{options.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				);

			case 'file': {
				const acceptAttr = accept ?? 'image/*';
				const showPrev = Boolean(showPreview);
				const previewClass = previewClassName;

				return (
					<div>
						<input
							id={inputId}
							name={name}
							type="file"
							accept={acceptAttr}
							onChange={e => {
								const file = e.target.files?.[0];
								if (!file) {
									onChange(e);
									return;
								}
								const reader = new FileReader();
								reader.onloadend = () => {
									const base64 = reader.result as string;
									const synthetic = {
										target: { value: base64, name },
									} as unknown as React.ChangeEvent<HTMLInputElement>;
									setPreviewSrc(base64);
									onChange(synthetic);
								};
								reader.readAsDataURL(file);
							}}
							className={baseClasses}
						/>
						{showPrev && (previewSrc ?? (value as string)) && (
							<div className="mt-3">
								<img src={previewSrc ?? (value as string)} alt="Preview" className={previewClass} />
							</div>
						)}
					</div>
				);
			}

			case 'number':
				return (
					<input
						type="number"
						id={inputId}
						name={name}
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						min={min}
						max={max}
						disabled={disabled}
						className={baseClasses}
					/>
				);

			case 'password':
				return (
					<input
						type="password"
						id={inputId}
						name={name}
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						disabled={disabled}
						className={baseClasses}
					/>
				);

			default: // 'text'
				return (
					<input
						type="text"
						id={inputId}
						name={name}
						value={value}
						onChange={onChange}
						placeholder={placeholder}
						disabled={disabled}
						className={baseClasses}
					/>
				);
		}
	};

	return (
		<div className="space-y-1">
			<label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>

			{renderInput()}

			{/* Validation Error Message (Zod/RHF) */}
			{hasError && <p className="text-red-500 text-sm mt-1">{error}</p>}

			{/* Help Text */}
			{helpText && !hasError && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
		</div>
	);
}

export function createOptionsFromObject(
	obj: Record<string, string>
): Array<{ value: string; label: string }> {
	return Object.entries(obj).map(([key, value]) => ({
		value: key,
		label: value,
	}));
}

export function createNumberOptions(
	min: number,
	max: number,
	step: number = 1
): Array<{ value: number; label: string }> {
	const options = [];
	for (let i = min; i <= max; i += step) {
		options.push({ value: i, label: i.toString() });
	}
	return options;
}
