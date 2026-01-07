import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingPanel from '@/components/ui/LoadingPanel';
import IncidentCard from '@/components/features/incidents/IncidentCard';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import { useActiveIncidentsForResponder } from '@/hooks/useIncident';
import { useAuth } from '@/context/AuthContext';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import type { Incident } from '@/types/incident';
import { createRoles, RESPONDER_ROLES } from '@/types/role';

export default function ResponderDashboardPage() {
	return (
		<AuthGuard requireRoles={createRoles([...RESPONDER_ROLES])}>
			<ResponderDashboardPageContent />
		</AuthGuard>
	);
}

function ResponderDashboardPageContent(): JSX.Element {
	const auth = useAuth();
	const navigate = useNavigate();
	const userId = auth?.user?.userId;

	const {
		incidents,
		loading: incidentsLoading,
		error: incidentsError,
		refetch: incidentsRefetch,
	} = useActiveIncidentsForResponder(userId, { enabled: !!userId });
	const showSingleError = useSingleErrorToast();

	useEffect(() => {
		showSingleError({
			key: 'responder-dashboard.incidents',
			error: incidentsError,
			loading: incidentsLoading,
			message: 'Unable to load your assigned incidents.',
		});
	}, [incidentsError, incidentsLoading, showSingleError]);

	const handleUpdateClick = (incident: Incident) => navigate(routes.incident(incident.incidentId));
	const handleChatClick = (incident: Incident) => navigate(routes.chatWith(incident.incidentId));

	const statusOrder: Record<Incident['status'], number> = {
		Open: 3,
		'In Progress': 2,
		Resolved: 1,
		Closed: 0,
	};

	const severityOrder: Record<Incident['severity'], number> = {
		CRITICAL: 4,
		HIGH: 3,
		MEDIUM: 2,
		LOW: 1,
	};

	const visibleIncidents = (incidents ?? [])
		.filter(i => i.status !== 'Closed')
		.sort((a, b) => {
			const statusDiff = statusOrder[b.status] - statusOrder[a.status];
			if (statusDiff !== 0) return statusDiff;
			return severityOrder[b.severity] - severityOrder[a.severity];
		});

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Responder Dashboard</h1>


				<section aria-busy={incidentsLoading} aria-live="polite">
					{incidentsLoading && <LoadingPanel text="Loading your incidents..." className="mb-6" />}

					{incidentsError && !incidentsLoading && (
						<ErrorRetryBlock
							message="Unable to load your assigned incidents."
							onRetry={() => incidentsRefetch()}
						/>
					)}

					{!incidentsLoading && !incidentsError && (
						<>
							{visibleIncidents.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{visibleIncidents.map(incident => (
										<IncidentCard
											key={incident.incidentId}
											incident={incident}
											onDetailsClick={handleUpdateClick}
											onChatClick={handleChatClick}
											primaryButtonText="Update"
											showTitleLink={false}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<p className="text-gray-500 text-lg">No incidents assigned to you at this time.</p>
								</div>
							)}
						</>
					)}
				</section>
			</div>
		</div>
	);
}