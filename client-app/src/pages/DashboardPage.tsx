import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingPanel from '@/components/ui/LoadingPanel';
import IncidentFilters from '@/components/features/incidents/IncidentFilters';
import IncidentCard from '@/components/features/incidents/IncidentCard';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import { useIncidents } from '@/hooks/useIncident';
import { useIncidentFilters } from '@/hooks/useIncidentFilters';
import { useAuth } from '@/context/AuthContext';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import type { Incident } from '@/types/incident';
import { REGION_ROLES, createRoles } from '@/types/role';

export default function DashboardPage() {
	return (
		<AuthGuard requireRoles={createRoles([...REGION_ROLES])}>
			<DashboardPageContent />
		</AuthGuard>
	);
}

function DashboardPageContent(): JSX.Element {
	const auth = useAuth();
	const navigate = useNavigate();
	const regionId =
		(auth?.user?.roles ?? [])
			.map(r => r.regionId)
			.find((id): id is number => typeof id === 'number') ?? 0;

	const {
		incidents,
		loading: incidentsLoading,
		error: incidentsError,
		refetch: incidentsRefetch,
	} = useIncidents(regionId, { enabled: true });
	const showSingleError = useSingleErrorToast();

	const { filters, setFilters, filteredIncidents, clearAllFilters } = useIncidentFilters({
		incidents,
	});

	useEffect(() => {
		showSingleError({
			key: 'dashboard.incidents',
			error: incidentsError,
			loading: incidentsLoading,
			message: 'Unable to load incidents.',
		});
	}, [incidentsError, incidentsLoading, showSingleError]);

	const handleDetailsClick = (incident: Incident) => navigate(routes.incident(incident.incidentId));

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

	const visibleIncidents = (filteredIncidents ?? [])
		.filter(i => i.status !== 'Closed')
		.sort((a, b) => {
			const statusDiff = statusOrder[b.status] - statusOrder[a.status];
			if (statusDiff !== 0) return statusDiff;
			return severityOrder[b.severity] - severityOrder[a.severity];
		});

	const openIncidents = visibleIncidents.filter(i => i.status === 'Open');
	const inProgressIncidents = visibleIncidents.filter(i => i.status === 'In Progress');
	const resolvedIncidents = visibleIncidents.filter(i => i.status === 'Resolved');
	const otherIncidents = inProgressIncidents.length + resolvedIncidents.length;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

				<IncidentFilters
					statusFilter={filters.statusFilter}
					priorityFilter={filters.priorityFilter}
					gripFilter={filters.gripFilter}
					timeFilter={filters.timeFilter}
					searchQuery={filters.searchQuery}
					onStatusChange={setFilters.setStatusFilter}
					onPriorityChange={setFilters.setPriorityFilter}
					onGripChange={setFilters.setGripFilter}
					onTimeChange={setFilters.setTimeFilter}
					onSearchChange={setFilters.setSearchQuery}
					onClearAll={clearAllFilters}
					hideClosedOption
				/>

				<section aria-busy={incidentsLoading} aria-live="polite">
					{incidentsLoading && <LoadingPanel text="Loading incidents..." className="mb-6" />}

					{incidentsError && !incidentsLoading && (
						<ErrorRetryBlock
							message="Unable to load incidents."
							onRetry={() => incidentsRefetch()}
						/>
					)}

					{!incidentsLoading && !incidentsError && (
						<>
							{openIncidents.length > 0 && (
								<>
									<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
										Open
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{openIncidents.map(incident => (
											<IncidentCard
												key={incident.incidentId}
												incident={incident}
												onDetailsClick={handleDetailsClick}
												onChatClick={() => {}}
											/>
										))}
									</div>
								</>
							)}

							{openIncidents.length > 0 && otherIncidents > 0 && (
								<hr className="my-6 border-t border-gray-200" />
							)}

							{inProgressIncidents.length > 0 && (
								<>
									<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
										In Progress
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
										{inProgressIncidents.map(incident => (
											<IncidentCard
												key={incident.incidentId}
												incident={incident}
												onDetailsClick={handleDetailsClick}
												onChatClick={() => {}}
											/>
										))}
									</div>
								</>
							)}

							{resolvedIncidents.length > 0 && (
								<>
									<h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-2">
										Resolved
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{resolvedIncidents.map(incident => (
											<IncidentCard
												key={incident.incidentId}
												incident={incident}
												onDetailsClick={handleDetailsClick}
												onChatClick={() => {}}
											/>
										))}
									</div>
								</>
							)}

							{visibleIncidents.length === 0 && (
								<div className="text-center py-12">
									<p className="text-gray-500 text-lg">No incidents found matching your filters.</p>
								</div>
							)}
						</>
					)}
				</section>
			</div>
		</div>
	);
}
