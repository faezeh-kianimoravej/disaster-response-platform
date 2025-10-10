import { useState, useEffect } from 'react';
import Button from '../components/Button';
import FormInput, { createOptionsFromObject } from '../components/FormInput';
import type { Resource, ResourceFormData } from './types';
import { validateResource } from './validation';
import{ getImageForResourceType,RESOURCE_TYPES} from './utils';
import { isFormValid } from '@/utils/validation';
import { useToast } from '../components/ToastProvider';



interface ResourceFormProps {
	initialData?: Partial<Resource>;
	isNewResource: boolean;
	onSave: (formData: ResourceFormData) => void;
	onCancel: () => void;
	onImageChange?: (imageSrc: string) => void;
}

export default function ResourceForm({
	initialData,
	isNewResource,
	onSave,
	onCancel,
	onImageChange,
}: ResourceFormProps) {
	const { showError } = useToast();
	const [form, setForm] = useState<ResourceFormData>({
		name: initialData?.name || '',
		description: initialData?.description || '',
		quantity: initialData?.quantity || 0,
		available: initialData?.available || 0,
		resourceType: initialData?.resourceType || 'Medical',
		departmentId: initialData?.departmentId || 101,
		image: initialData?.image || getImageForResourceType(initialData?.resourceType || 'Medical'),
	});

	const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

	// Notify parent of initial image for new resources
	useEffect(() => {
		if (isNewResource && !initialData) {
			onImageChange?.(form.image);
		}
	}, [isNewResource, initialData, form.image, onImageChange]);

	// Update form when initialData changes
	useEffect(() => {
		if (initialData) {
			const newForm: ResourceFormData = {
				name: initialData.name || '',
				description: initialData.description || '',
				quantity: initialData.quantity || 0,
				available: initialData.available || 0,
				resourceType: initialData.resourceType || 'Medical',
				departmentId: initialData.departmentId || 101,
				image: initialData.image || getImageForResourceType(initialData.resourceType || 'Medical'),
			};
			setForm(newForm);
			// Notify parent of initial image
			onImageChange?.(newForm.image);
		}
	}, [initialData, onImageChange]);

	// Use validation functions from resources.ts
	const validation = validateResource(form);

	// Computed validation state
	const isValid = isFormValid(validation);
	const showValidation = (fieldName: string): boolean =>
		(touched[fieldName] && !validation[fieldName as keyof typeof validation]?.isValid) || false;

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) {
		const { name, value } = e.target;
		const isNumberField = name === 'quantity' || name === 'available' || name === 'departmentId';
		const newValue = isNumberField ? Number(value) : value;

		// Mark field as touched
		setTouched(prev => ({ ...prev, [name]: true }));

		setForm((prev: ResourceFormData) => {
			const updatedForm = {
				...prev,
				[name]: newValue,
			};

			// Update image when resource type changes
			if (name === 'resourceType' && typeof newValue === 'string') {
				updatedForm.image = getImageForResourceType(newValue);
				// Notify parent component of image change
				onImageChange?.(updatedForm.image);
			}

			// Smart quantity/available adjustment logic
			if (name === 'quantity' && typeof newValue === 'number') {
				const oldQuantity = prev.quantity;
				const quantityChange = newValue - oldQuantity;

				if (quantityChange > 0) {
					// Quantity increased: add the increase to available (new items are available)
					updatedForm.available = Math.min(prev.available + quantityChange, newValue);
				} else if (quantityChange < 0) {
					// Quantity decreased: cap available at new quantity (might have removed unavailable items)
					updatedForm.available = Math.min(prev.available, newValue);
				}
			} else if (
				name === 'available' &&
				typeof newValue === 'number' &&
				newValue > updatedForm.quantity
			) {
				// Ensure available never exceeds quantity when directly editing available
				updatedForm.available = updatedForm.quantity;
			}

			return updatedForm;
		});
	}

	function handleSubmit() {
		// Mark all fields as touched to show validation
		setTouched({
			name: true,
			description: true,
			quantity: true,
			available: true,
			resourceType: true,
			departmentId: true,
		});

		// Check if form is valid using centralized validation
		if (!isValid) {
			const errors = Object.values(validation)
				.filter(field => !field.isValid)
				.map(field => field.message);
			showError('Please fix the following errors:\n' + errors.join('\n'));
			return;
		}
		

		onSave(form);
	}

	return (
		<div>
			<h2 className="text-2xl font-semibold mb-4">
				{isNewResource ? 'Create New Resource' : 'Edit Resource'}
			</h2>
			<div className="space-y-3">
				<FormInput
					label="Name"
					name="name"
					value={form.name}
					onChange={handleChange}
					required
					validation={validation.name}
					showValidation={showValidation('name')}
				/>

				<FormInput
					label="Description"
					name="description"
					value={form.description}
					onChange={handleChange}
					type="textarea"
				/>

				<div className="grid grid-cols-2 gap-3">
					<FormInput
						label="Resource Type"
						name="resourceType"
						value={form.resourceType}
						onChange={handleChange}
						type="select"
						options={createOptionsFromObject(RESOURCE_TYPES)}
					/>


					<FormInput
						label="Department ID"
						name="departmentId"
						value={form.departmentId}
						onChange={handleChange}
						type="number"
						validation={validation.departmentId}
						showValidation={showValidation('departmentId')}
					/>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<FormInput
						label="Quantity"
						name="quantity"
						value={form.quantity}
						onChange={handleChange}
						type="number"
						min={0}
						validation={validation.quantity}
						showValidation={showValidation('quantity')}
					/>

					<FormInput
						label="Available"
						name="available"
						value={form.available}
						onChange={handleChange}
						type="number"
						min={0}
						max={form.quantity}
						validation={validation.available}
						showValidation={showValidation('available')}
						helpText={`Maximum: ${form.quantity}`}
					/>
				</div>
			</div>
			<div className="mt-6 flex justify-end space-x-3">
				<Button onClick={handleSubmit} variant={isValid ? 'success' : 'disabled'}>
					{isNewResource ? 'Create' : 'Save'}
				</Button>
				<Button onClick={onCancel} variant="outline">
					Cancel
				</Button>
			</div>
		</div>
	);
}
