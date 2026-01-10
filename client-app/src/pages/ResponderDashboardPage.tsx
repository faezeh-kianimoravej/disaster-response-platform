import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingPanel from '@/components/ui/LoadingPanel';
import IncidentCard from '@/components/features/incidents/IncidentCard';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import { useIncidentForResponder } from '@/hooks/useDeployment';
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
		incident,
		loading: incidentLoading,
		error: incidentError,
		refetch: incidentRefetch,
	} = useIncidentForResponder(userId, { enabled: !!userId });
	const showSingleError = useSingleErrorToast();

	useEffect(() => {
		showSingleError({
			key: 'responder-dashboard.incident',
			error: incidentError,
			loading: incidentLoading,
			message: 'Unable to load your assigned incident.',
		});
	}, [incidentError, incidentLoading, showSingleError]);

	const handleUpdateClick = (incident: Incident) =>
		navigate(routes.incidentUpdate(incident.incidentId));
	const handleChatClick = (incident: Incident) => navigate(routes.chatWith(incident.incidentId));

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Your Current Incident</h1>
				<p className="text-gray-600 mt-2">
					Your currently assigned incident for response operations
				</p>
			</div>

			{incidentLoading && <LoadingPanel text="Loading your incident..." className="mt-8" />}

			{incidentError && !incidentLoading && (
				<ErrorRetryBlock
					message="Unable to load your assigned incident."
					onRetry={() => incidentRefetch()}
					className="mt-8"
				/>
			)}

			{!incidentLoading && !incidentError && !incident && (
				<div className="text-center mt-12">
					<div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Incident</h3>
						<p className="text-gray-600">You don&apos;t currently have an assigned incident.</p>
					</div>
				</div>
			)}

			{!incidentLoading && !incidentError && incident && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<IncidentCard
						incident={incident}
						showTitleLink={false}
						primaryButtonText="Send Update"
						onDetailsClick={() => handleUpdateClick(incident)}
						onChatClick={() => handleChatClick(incident)}
					/>
				</div>
			)}
		</div>
	);
}
