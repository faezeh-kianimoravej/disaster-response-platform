import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import FormInput, { createOptionsFromObject } from '@/components/FormInput';
import type { Resource, ResourceFormData } from '@/types/resource';
import { validateResource } from '@/validation/resourceValidation';
import { getImageForResourceType, RESOURCE_TYPES } from '@/utils/resourceUtils';
import { isFormValid } from '@/utils/validation';
import { useToast } from '@/components/toast/ToastProvider';

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
		resourceType: initialData?.resourceType || 'FIELD_OPERATOR',
		departmentId: initialData?.departmentId || 101,
		image:
			initialData?.image || getImageForResourceType(initialData?.resourceType || 'FIELD_OPERATOR'),
	});

	const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

	useEffect(() => {
		if (isNewResource && !initialData) {
			onImageChange?.(form.image);
		}
	}, [isNewResource, initialData, form.image, onImageChange]);

	useEffect(() => {
		if (initialData) {
			const newForm: ResourceFormData = {
				name: initialData.name || '',
				description: initialData.description || '',
				quantity: initialData.quantity || 0,
				available: initialData.available || 0,
				resourceType: initialData.resourceType || 'Medical',
				departmentId: initialData.departmentId || 101,
				image:
					initialData.image ||
					getImageForResourceType(initialData.resourceType || 'FIELD_OPERATOR'),
			};
			setForm(newForm);
			onImageChange?.(newForm.image);
		}
	}, [initialData, onImageChange]);

	const validation = validateResource(form);
	const isValid = isFormValid(validation);
	const showValidation = (fieldName: string): boolean =>
		(touched[fieldName] && !validation[fieldName as keyof typeof validation]?.isValid) || false;

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) {
		const { name, value } = e.target;
		const isNumberField = name === 'quantity' || name === 'available' || name === 'departmentId';
		const newValue = isNumberField ? Number(value) : value;

		setTouched(prev => ({ ...prev, [name]: true }));

		setForm((prev: ResourceFormData) => {
			const updatedForm = { ...prev, [name]: newValue } as unknown as ResourceFormData;

			if (name === 'resourceType' && typeof newValue === 'string') {
				updatedForm.image = getImageForResourceType(newValue);
				onImageChange?.(updatedForm.image);
			}

			if (name === 'quantity' && typeof newValue === 'number') {
				const oldQuantity = prev.quantity;
				const quantityChange = newValue - oldQuantity;

				if (quantityChange > 0) {
					updatedForm.available = Math.min(prev.available + quantityChange, newValue);
				} else if (quantityChange < 0) {
					updatedForm.available = Math.min(prev.available, newValue);
				}
			} else if (
				name === 'available' &&
				typeof newValue === 'number' &&
				newValue > updatedForm.quantity
			) {
				updatedForm.available = updatedForm.quantity;
			}

			return updatedForm;
		});
	}

	function handleSubmit() {
		setTouched({
			name: true,
			description: true,
			quantity: true,
			available: true,
			resourceType: true,
			departmentId: true,
		});

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
