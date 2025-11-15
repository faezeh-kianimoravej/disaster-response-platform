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
	multiple?: boolean;
} & Partial<
	Omit<
		Parameters<typeof FormInput>[0],
		'label' | 'name' | 'value' | 'onChange' | 'options' | 'type' | 'multiple'
	>
>;

export default function RHFSelect<
	TFormValues extends FieldValues,
	V extends string | number = string | number,
>(props: RHFSelectProps<TFormValues, V>) {
	const { name, label, options, valueType, multiple, ...rest } = props;
	const multi = multiple ?? false;
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
			}) => {
				const value = multi
					? Array.isArray(field.value)
						? field.value.map(String)
						: field.value
							? [String(field.value)]
							: []
					: (field.value as unknown as string | number);

				return (
					<FormInput
						label={label}
						name={String(name)}
						value={value}
						onChange={e => {
							if (multi) {
								const selected: string[] = Array.from(
									(e.target as HTMLSelectElement).selectedOptions
								).map(o => o.value);
								field.onChange(selected);
							} else {
								const raw = (e.target as HTMLSelectElement).value;
								field.onChange(inferredType === 'number' ? Number(raw) : raw);
							}
						}}
						type="select"
						options={options as Array<{ value: string | number; label: string }>}
						error={fieldState.error?.message ?? undefined}
						showValidation={Boolean(fieldState.error)}
						multiple={multi}
						size={multi ? 5 : undefined}
						{...rest}
					/>
				);
			}}
		/>
	);
}
