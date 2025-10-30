import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IncidentPriorityForm from '@/components/IncidentPriorityForm';
import { useToast } from '@/components/toast/ToastProvider';
import Badge from '@/components/Badge';
import AuthGuard from '@/components/AuthGuard';
import LoadingPanel from '@/components/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ErrorRetry';
import { useIncident } from '@/hooks/useIncident';

export default function IncidentPriorityPage() {
	return (
		<AuthGuard requireRoles={['Calamity Coordinator', 'Chair Safety Region', 'Region Admin']}>
			<IncidentPriorityContent />
		</AuthGuard>
	);
}

function IncidentPriorityContent() {
	const { incidentId } = useParams<{ incidentId: string }>();
	const navigate = useNavigate();
	const toast = useToast();

	const id = incidentId ? Number(incidentId) : undefined;
	const { incident, loading, error, fetchIncident } = useIncident(id);

	useEffect(() => {
		if (!error) return;
		toast.showError(error);
	}, [error, toast]);

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<h1 className="text-2xl font-bold mb-4">Prioritize Incident</h1>

				{loading && (
					<div className="mb-6">
						<LoadingPanel />
					</div>
				)}

				{error && (
					<div className="mb-6">
						<ErrorRetryBlock onRetry={() => fetchIncident?.()} />
					</div>
				)}

				{!loading && !error && !incident && <div className="p-6">Incident not found</div>}

				{incident && (
					<>
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

						<IncidentPriorityForm
							incident={incident}
							onCancel={() => navigate(-1)}
							onSuccess={() => navigate(`/incidents/${incident.incidentId}`)}
						/>
					</>
				)}
			</div>
		</div>
	);
}
