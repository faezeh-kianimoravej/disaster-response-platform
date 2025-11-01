import { Controller, useFormContext, type Path, type FieldValues } from 'react-hook-form';
import FormInput from '@/components/forms/base/FormInput';

type RHFInputProps<TFormValues extends FieldValues> = {
	name: Path<TFormValues>;
	label: string;
	placeholder?: string;
	required?: boolean;
	type?: 'text' | 'number' | 'textarea' | 'select';
	options?: Array<{ value: string | number; label: string }>;
};

export default function RHFInput<TFormValues extends FieldValues>({
	name,
	label,
	placeholder,
	required = false,
	type = 'text',
	options = [],
}: RHFInputProps<TFormValues>) {
	const { control } = useFormContext<TFormValues>();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState }) => (
				<FormInput
					label={label}
					name={String(name)}
					value={
						type === 'number'
							? field.value === '' || field.value === undefined
								? ''
								: (Number(field.value) as unknown as number)
							: ((field.value as unknown as string) ?? '')
					}
					onChange={e => {
						const raw = (e.target as HTMLInputElement).value;
						if (type === 'number') {
							field.onChange(raw === '' ? '' : Number(raw));
						} else {
							field.onChange(raw);
						}
					}}
					placeholder={placeholder ?? ''}
					required={required}
					error={fieldState.error?.message ?? undefined}
					showValidation={Boolean(fieldState.error)}
					type={type}
					options={options}
				/>
			)}
		/>
	);
}
