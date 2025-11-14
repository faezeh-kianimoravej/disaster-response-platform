import { Controller, useFormContext } from 'react-hook-form';

type Option = { value: string; label: string };

interface RHFCheckboxGroupProps {
	name: string;
	label?: string;
	options: Option[];
	className?: string;
}

export default function RHFCheckboxGroup({
	name,
	label,
	options,
	className,
}: RHFCheckboxGroupProps) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => {
				const valueArray: string[] = Array.isArray(field.value) ? field.value : [];

				const toggle = (optVal: string) => {
					const exists = valueArray.includes(optVal);
					const next = exists ? valueArray.filter(v => v !== optVal) : [...valueArray, optVal];
					field.onChange(next);
				};

				return (
					<fieldset className={`space-y-2 ${className ?? ''}`}>
						{label && <legend className="block text-sm font-medium text-gray-700">{label}</legend>}
						<div
							className="grid gap-2"
							style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}
						>
							{options.map(opt => {
								const checked = valueArray.includes(opt.value);
								const chipClass = checked
									? 'bg-blue-600 text-white border-blue-600 shadow'
									: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
								return (
									<label
										key={opt.value}
										className={`cursor-pointer select-none rounded-md px-3 py-1 text-sm border flex items-center justify-center text-center w-full ${chipClass}`}
										title={opt.label}
									>
										<input
											type="checkbox"
											className="sr-only"
											value={opt.value}
											checked={checked}
											onChange={() => toggle(opt.value)}
											aria-checked={checked}
										/>
										<span className="text-sm w-full truncate whitespace-nowrap text-center">
											{opt.label}
										</span>
									</label>
								);
							})}
						</div>
					</fieldset>
				);
			}}
		/>
	);
}
