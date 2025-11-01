import {
	Controller,
	useFormContext,
	type Path,
	type ControllerRenderProps,
	type ControllerFieldState,
	type FieldValues,
} from 'react-hook-form';
import FormInput from '@/components/forms/base/FormInput';

type Option<V extends string | number> = { value: V; label: string };

type RHFSelectProps<
	TFormValues extends FieldValues,
	V extends string | number = string | number,
> = {
	name: Path<TFormValues>;
	label: string;
	options: Option<V>[];
	valueType?: 'string' | 'number';
} & Partial<
	Omit<
		Parameters<typeof FormInput>[0],
		'label' | 'name' | 'value' | 'onChange' | 'options' | 'type'
	>
>;

export default function RHFSelect<
	TFormValues extends FieldValues,
	V extends string | number = string | number,
>({ name, label, options, valueType, ...rest }: RHFSelectProps<TFormValues, V>) {
	const { control } = useFormContext<TFormValues>();
	const inferredType = valueType ?? (typeof options?.[0]?.value === 'number' ? 'number' : 'string');

	return (
		<Controller
			name={name}
			control={control}
			render={({
				field,
				fieldState,
			}: {
				field: ControllerRenderProps<TFormValues, Path<TFormValues>>;
				fieldState: ControllerFieldState;
			}) => (
				<FormInput
					label={label}
					name={String(name)}
					value={field.value as unknown as string | number}
					onChange={e => {
						const raw = (e.target as HTMLSelectElement).value;
						field.onChange(inferredType === 'number' ? Number(raw) : raw);
					}}
					type="select"
					options={options as Array<{ value: string | number; label: string }>}
					error={fieldState.error?.message ?? undefined}
					showValidation={Boolean(fieldState.error)}
					{...rest}
				/>
			)}
		/>
	);
}
