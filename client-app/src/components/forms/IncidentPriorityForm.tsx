import { useEffect, useMemo } from 'react';
import type { Incident, IncidentFormData, IncidentSeverity } from '@/types/incident';
import { INCIDENT_SEVERITIES } from '@/types/incident';
import { createNumberOptions } from '@/components/forms/base/FormInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import incidentRequestSchema from '@/validation/incidentValidation';
import { z } from 'zod';
import { useUpdateIncident } from '@/hooks/useIncident';
import { useToast } from '@/components/toast/ToastProvider';
import RHFSelect from '@/components/forms/rhf/RHFSelect';
import FormShell from '@/components/forms/base/FormShell';

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

	const updateMutation = useUpdateIncident(incident.regionId);

	const onSubmit = async (values: FormValues) => {
		if (!incident) return;
		try {
			await updateMutation.mutateAsync({
				id: incident.incidentId,
				data: {
					severity: values.severity,
					gripLevel: values.gripLevel,
				} as Partial<IncidentFormData>,
			});
			toast.showSuccess('Incident updated');
			if (typeof onSuccess === 'function') onSuccess();
		} catch (err) {
			if (typeof onFailure === 'function') onFailure(err);
		}
	};

	return (
		<FormShell
			methods={methods}
			onSubmit={onSubmit}
			className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
			footer={{ onCancel, disabled: isSubmitting || updateMutation.isPending }}
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
