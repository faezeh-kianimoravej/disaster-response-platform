import { Controller, useFormContext, type Path, type FieldValues } from 'react-hook-form';
import FormInput from '@/components/forms/base/FormInput';
import { getDisplayImageSrc } from '@/utils/resourceUtils';

type RHFImageInputProps<TFormValues extends FieldValues> = {
	name: Path<TFormValues>;
	label: string;
	accept?: string;
	previewClassName?: string;
};

export default function RHFImageInput<TFormValues extends FieldValues>({
	name,
	label,
	accept = 'image/*',
	previewClassName = 'h-32 w-32 object-cover border rounded-md',
}: RHFImageInputProps<TFormValues>) {
	const { control } = useFormContext<TFormValues>();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<FormInput
					label={label}
					name={String(name)}
					value={getDisplayImageSrc((field.value as unknown as string) ?? '') ?? ''}
					onChange={e => {
						// FormInput will emit a synthetic event with target.value set to base64 for file inputs
						const v = (e.target as HTMLInputElement).value;
						field.onChange(v);
					}}
					type="file"
					accept={accept}
					showPreview
					previewClassName={previewClassName}
					error={fieldState.error?.message ?? undefined}
					showValidation={Boolean(fieldState.error)}
				/>
			)}
		/>
	);
}
