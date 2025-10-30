import { useEffect, useMemo } from 'react';
import type { Incident, IncidentFormData, IncidentSeverity } from '@/types/incident';
import { INCIDENT_SEVERITIES } from '@/types/incident';
import { createNumberOptions } from './FormInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import incidentRequestSchema from '@/validation/incidentValidation';
import { z } from 'zod';
import { useUpdateIncidentForm } from '@/hooks/useIncident';
import { useToast } from '@/components/toast/ToastProvider';
import RHFSelect from './RHFSelect';
import FormShell from './FormShell';

export type IncidentPriorityFormProps = {
	incident: Incident;
	onCancel?: () => void;
	onSuccess?: (updatedIncident?: Incident) => void;
	onFailure?: (error?: unknown) => void;
};

const prioritySchema = incidentRequestSchema.pick({ severity: true, gripLevel: true });
type FormValues = z.infer<typeof prioritySchema>;

export default function IncidentPriorityForm({
	incident,
	onCancel,
	onSuccess,
	onFailure,
}: IncidentPriorityFormProps) {
	const defaultValues: FormValues = useMemo(
		() => ({
			severity: (incident.severity as IncidentSeverity) ?? 'Low',
			gripLevel: incident.gripLevel ?? 0,
		}),
		[incident]
	);
	const methods = useForm<FormValues>({
		resolver: zodResolver(prioritySchema),
		defaultValues,
		mode: 'onSubmit',
	});

	const { formState } = methods;
	const { isSubmitting } = formState;

	useEffect(() => {
		methods.reset(defaultValues);
	}, [defaultValues, methods]);

	const toast = useToast();

	const {
		submit: submitUpdate,
		validation: hookValidation,
		loading,
	} = useUpdateIncidentForm(incident.regionId);

	const onSubmit = async (values: FormValues) => {
		if (!incident) return;
		const fullPayload = { ...incident, severity: values.severity, gripLevel: values.gripLevel };

		const ok = await submitUpdate(incident.incidentId, fullPayload as Partial<IncidentFormData>);
		if (ok) {
			toast.showSuccess('Incident updated');
			if (typeof onSuccess === 'function') onSuccess();
		} else {
			if (typeof onFailure === 'function') onFailure(new Error('Validation failed'));
		}
	};

	return (
		<FormShell
			methods={methods}
			onSubmit={onSubmit}
			serverValidation={hookValidation}
			className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
			footer={{ onCancel, disabled: isSubmitting || loading }}
		>
			<div className="mb-4">
				<RHFSelect
					name="severity"
					label="Severity"
					options={INCIDENT_SEVERITIES.map(s => ({ value: s, label: s }))}
				/>
			</div>

			<div className="mb-4">
				<RHFSelect name="gripLevel" label="GRIP level" options={createNumberOptions(0, 5)} />
			</div>
		</FormShell>
	);
}
