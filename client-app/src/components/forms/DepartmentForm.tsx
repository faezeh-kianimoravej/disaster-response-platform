import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormShell from '@/components/forms/base/FormShell';
import RHFInput from '@/components/forms/rhf/RHFInput';
import RHFImageInput from '@/components/forms/rhf/RHFImageInput';
import {
	departmentRequestSchema,
	type DepartmentRequestValues,
} from '@/validation/departmentValidation';
import { useCreateDepartment, useUpdateDepartment } from '@/hooks/useDepartment';
import { useToast } from '@/components/toast/ToastProvider';
import type { Department, DepartmentFormData } from '@/types/department';

const DEFAULT_DEPARTMENT_IMAGE = '/images/default.png';

type DepartmentFormProps = {
	initialData?: Partial<Department>;
	isNewDepartment: boolean;
	municipalityId: number;
	onCancel?: () => void;
	onSuccess?: (dept?: Department) => void;
	onFailure?: (err?: unknown) => void;
};

export default function DepartmentForm({
	initialData,
	isNewDepartment,
	municipalityId,
	onCancel,
	onSuccess,
	onFailure,
}: DepartmentFormProps) {
	const toast = useToast();

	const defaultValues: DepartmentRequestValues = useMemo(
		() => ({
			name: initialData?.name ?? '',
			image: initialData?.image ?? DEFAULT_DEPARTMENT_IMAGE,
			municipalityId: initialData?.municipalityId ?? municipalityId,
		}),
		[initialData, municipalityId]
	);

	const methods = useForm<DepartmentRequestValues>({
		resolver: zodResolver(departmentRequestSchema),
		defaultValues,
		mode: 'onSubmit',
	});

	const { reset } = methods;

	useEffect(() => {
		reset(defaultValues);
	}, [defaultValues, reset]);

	const createMutation = useCreateDepartment(municipalityId ?? -1);
	const updateMutation = useUpdateDepartment(municipalityId ?? -1);

	const [serverValidation, setServerValidation] = useState<Record<string, string> | null>(null);

	const onSubmit = async (values: DepartmentRequestValues) => {
		setServerValidation(null);
		try {
			if (isNewDepartment) {
				const saved = await createMutation.mutateAsync(values as DepartmentFormData);
				onSuccess?.(saved);
				return;
			}

			const id = (initialData?.departmentId as number) ?? 0;
			const updated = await updateMutation.mutateAsync({
				id,
				data: values as DepartmentFormData,
			});
			onSuccess?.(updated);
		} catch (err) {
			const apiErr = err as {
				validationErrors?: Record<string, string>;
				message?: string;
			};
			if (apiErr.validationErrors) {
				setServerValidation(apiErr.validationErrors);
				onFailure?.(apiErr);
				return;
			}
			toast.showError(apiErr.message ?? 'An unexpected error occurred while saving.');
			onFailure?.(apiErr ?? err);
		}
	};

	return (
		<FormShell
			methods={methods}
			onSubmit={onSubmit}
			serverValidation={serverValidation}
			footer={{ onCancel }}
		>
			<div>
				<h2 className="text-2xl font-semibold mb-4">
					{isNewDepartment ? 'Create New Department' : 'Edit Department'}
				</h2>

				<div className="space-y-3">
					<RHFInput
						name="name"
						label="Department Name"
						placeholder="Enter department name"
						required
					/>

					<RHFImageInput name="image" label="Image Upload" />
				</div>
			</div>
		</FormShell>
	);
}
