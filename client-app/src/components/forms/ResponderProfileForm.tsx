import RHFSelect from '@/components/forms/rhf/RHFSelect';
import RHFCheckboxGroup from '@/components/forms/rhf/RHFCheckboxGroup';
import { RESPONDER_SPECIALIZATIONS } from '@/types/responderSpecialization';

export default function ResponderProfileForm() {
	return (
		<div className="space-y-4 border rounded p-4 bg-gray-50">
			<h3 className="text-lg font-semibold mb-2">Responder Profile</h3>
			<RHFSelect
				name="responderProfile.primarySpecialization"
				label="Primary Specialization"
				options={RESPONDER_SPECIALIZATIONS.map(s => ({ label: s, value: s }))}
				required
			/>
			<RHFCheckboxGroup
				name="responderProfile.secondarySpecializations"
				label="Secondary Specializations"
				options={RESPONDER_SPECIALIZATIONS.map(s => ({ label: s, value: s }))}
				className="mt-1"
			/>
		</div>
	);
}
