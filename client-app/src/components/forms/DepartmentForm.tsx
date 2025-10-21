import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import type { Department, DepartmentFormData } from '@/types/department';
import { validateDepartment } from '@/validation/departmentValidation';
import { isFormValid } from '@/utils/validation';
import { useToast } from '@/components/toast/ToastProvider';

const DEFAULT_DEPARTMENT_IMAGE = '/images/default.png';

interface DepartmentFormProps {
	initialData?: Partial<Department>;
	isNewDepartment: boolean;
	onSave: (formData: DepartmentFormData) => void;
	onCancel: () => void;
	onImageChange?: (imageSrc: string) => void;
	municipalityId: number;
}

export default function DepartmentForm({
	initialData,
	isNewDepartment,
	onSave,
	onCancel,
	onImageChange,
	municipalityId,
}: DepartmentFormProps) {
	const { showError } = useToast();

	const defaultImage = initialData?.image || DEFAULT_DEPARTMENT_IMAGE;

	const [form, setForm] = useState<DepartmentFormData>({
		name: initialData?.name || '',
		image: defaultImage,
		municipalityId: initialData?.municipalityId || municipalityId,
	});

	const [preview, setPreview] = useState<string>(defaultImage);
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (initialData) {
			const img = initialData.image || DEFAULT_DEPARTMENT_IMAGE;
			setForm({
				name: initialData.name || '',
				image: img,
				municipalityId: initialData.municipalityId || municipalityId,
			});
			setPreview(img);
		}
	}, [initialData, municipalityId]);

	// Validation
	const validation = validateDepartment(form);
	const isValid = isFormValid(validation);
	const showValidation = (field: string) =>
		(touched[field] && !validation[field as keyof typeof validation]?.isValid) || false;

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) {
		const { name, value } = e.target;
		setTouched(prev => ({ ...prev, [name]: true }));
		setForm(prev => ({ ...prev, [name]: value }));
	}

	function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			const base64 = reader.result as string;
			setForm(prev => ({ ...prev, image: base64 }));
			setPreview(base64);
			onImageChange?.(base64);
		};
		reader.readAsDataURL(file);
	}

	function handleSubmit() {
		setTouched({ name: true, image: true });

		if (!isValid) {
			const errors = Object.values(validation)
				.filter(f => !f.isValid)
				.map(f => f.message);
			showError('Please fix the following errors:\n' + errors.join('\n'));
			return;
		}

		onSave(form);
	}

	return (
		<div>
			<h2 className="text-2xl font-semibold mb-4">
				{isNewDepartment ? 'Create New Department' : 'Edit Department'}
			</h2>

			<div className="space-y-3">
				<FormInput
					label="Department Name"
					name="name"
					value={form.name}
					onChange={handleChange}
					required
					validation={validation.name}
					showValidation={showValidation('name')}
					placeholder="Enter department name"
				/>

				{/* Image Upload Section */}
				<div>
					<label htmlFor="image-url-input" className="block text-gray-700 font-medium mb-1">
						Image Upload <span className="text-red-500">*</span>
					</label>
					<input
						id="image-url-input"
						type="file"
						accept="image/*"
						onChange={handleImageChange}
						className="block w-full text-gray-700 border border-gray-300 rounded-md p-2"
					/>
					{showValidation('image') && (
						<p className="text-red-500 text-sm mt-1">{validation.image.message}</p>
					)}
					<div className="mt-3">
						<img src={preview} alt="Preview" className="h-32 w-32 object-cover border rounded-md" />
					</div>
				</div>
			</div>

			<div className="mt-6 flex justify-end space-x-3">
				<Button onClick={handleSubmit} variant={isValid ? 'success' : 'disabled'}>
					{isNewDepartment ? 'Create' : 'Save'}
				</Button>
				<Button onClick={onCancel} variant="outline">
					Cancel
				</Button>
			</div>
		</div>
	);
}
