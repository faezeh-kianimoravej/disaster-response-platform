import RHFSelect from '@/components/forms/rhf/RHFSelect';
import { RESPONDER_SPECIALIZATIONS } from '@/types/responderSpecialization';
import { Controller, useFormContext } from 'react-hook-form';

export default function ResponderProfileForm() {
	const { control } = useFormContext();

	return (
		<div className="space-y-4 border rounded p-4 bg-gray-50">
			<h3 className="text-lg font-semibold mb-2">Responder Profile</h3>
			<Controller
				name="responderProfile.primarySpecialization"
				control={control}
				render={({ field, fieldState }) => (
					<RHFSelect
						{...field}
						label="Primary Specialization"
						options={RESPONDER_SPECIALIZATIONS.map(s => ({ label: s, value: s }))}
						error={fieldState.error?.message}
						required
					/>
				)}
			/>
			<Controller
				name="responderProfile.secondarySpecializations"
				control={control}
				render={({ field, fieldState }) => (
					<RHFSelect
						{...field}
						label="Secondary Specializations"
						options={RESPONDER_SPECIALIZATIONS.map(s => ({ label: s, value: s }))}
						error={fieldState.error?.message}
						valueType="string"
						helpText="Hold Ctrl (Cmd on Mac) to select multiple."
						multiple
					/>
				)}
			/>
		</div>
	);
}
