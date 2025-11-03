import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIncidentById, updateIncident } from '@/api/incident';
import type { Incident, IncidentSeverity } from '@/types/incident';
import Button from '@/components/Button';
import FormInput, { createNumberOptions } from '@/components/FormInput';
import { useToast } from '@/components/toast/ToastProvider';
import Badge from '@/components/Badge';

const severities: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

export default function IncidentPriorityPage() {
	const { incidentId } = useParams<{ incidentId: string }>();
	const navigate = useNavigate();
	const toast = useToast();
	const [incident, setIncident] = useState<Incident | null>(null);
	const [severity, setSeverity] = useState<IncidentSeverity>('Low');
	const [grip, setGrip] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!incidentId) return;
		const id = Number(incidentId);
		const load = async () => {
			try {
				setLoading(true);
				const data = await getIncidentById(id);
				if (data) {
					setIncident(data);
					setSeverity(data.severity);
					setGrip(data.gripLevel ?? 0);
				}
			} catch {
				// handle error if needed
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [incidentId]);

	const validate = () => {
		if (!severity) {
			toast.showError('Please select a severity');
			return false;
		}
		if (grip < 0 || grip > 5) {
			toast.showError('GRIP level must be between 0 and 5');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!incident) return;
		if (!validate()) return;
		setSubmitting(true);
		try {
			await updateIncident(incident.incidentId, {
				...incident,
				severity,
				gripLevel: grip,
			});

			toast.showSuccess('Incident updated');
			navigate(`/incidents/${incident.incidentId}`);
		} catch {
			toast.showError('Failed to update incident');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="p-6">Loading...</div>;
	if (!incident) return <div className="p-6">Incident not found</div>;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-5xl mx-auto px-4">
				<h1 className="text-2xl font-bold mb-4">Prioritize Incident</h1>

				<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
					<div className="flex gap-3 items-center mb-3">
						<Badge
							variant={
								incident.severity === 'Critical'
									? 'critical'
									: incident.severity === 'High'
										? 'high'
										: incident.severity === 'Medium'
											? 'medium'
											: 'low'
							}
							className="text-sm"
						>
							Priority: {incident.severity}
						</Badge>
						<Badge variant="default" className="text-sm">
							GRIP: {incident.gripLevel}
						</Badge>
					</div>
					<div className="text-sm text-gray-700 mb-2">
						{incident.description ? (
							<div className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">
								{incident.description}
							</div>
						) : (
							<span className="text-gray-500">No description provided.</span>
						)}
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
				>
					<div className="mb-4">
						<FormInput
							label="Severity"
							name="severity"
							value={severity}
							onChange={e => setSeverity(e.target.value as IncidentSeverity)}
							type="select"
							options={severities.map(s => ({ value: s, label: s }))}
						/>
					</div>

					<div className="mb-4">
						<FormInput
							label="GRIP level"
							name="gripLevel"
							value={grip}
							onChange={e => setGrip(Number(e.target.value))}
							type="select"
							options={createNumberOptions(0, 5)}
						/>
					</div>

					<div className="mt-6 flex justify-end space-x-4">
						<Button
							type="submit"
							variant={submitting ? 'disabled' : 'success'}
							className="px-4"
							disabled={submitting}
						>
							Save
						</Button>
						<Button type="button" variant="outline" onClick={() => navigate(-1)}>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
