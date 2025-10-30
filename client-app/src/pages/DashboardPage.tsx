import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthGuard from '@/components/AuthGuard';
import LoadingPanel from '@/components/LoadingPanel';
import SearchSelect from '@/components/SearchSelect';
import IncidentFilters from '@/components/IncidentFilters';
import IncidentCard from '@/components/IncidentCard';
import { ErrorRetryInline, ErrorRetryBlock } from '@/components/ErrorRetry';

import { useIncidents } from '@/hooks/useIncident';
import { useRegion } from '@/hooks/useRegion';
import { useIncidentFilters } from '@/hooks/useIncidentFilters';
import { useAuth, useUserHasAnyRole } from '@/context/AuthContext';
import { useToast } from '@/components/toast/ToastProvider';

import type { Incident } from '@/types/incident';

export default function DashboardPage() {
	return (
		<AuthGuard requireRoles={['Calamity Coordinator', 'Chair Safety Region', 'Region Admin']}>
			<DashboardPageContent />
		</AuthGuard>
	);
}

function DashboardPageContent(): JSX.Element {
	const auth = useAuth();
	const navigate = useNavigate();
	const isSuper = useUserHasAnyRole(['Super Admin']);

	const { regions, fetchRegions, error: regionsError } = useRegion({ enabled: isSuper });
	const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
		auth?.user?.regionId ?? null
	);

	useEffect(() => {
		if (isSuper && regions.length > 0 && selectedRegionId === null) {
			setSelectedRegionId(regions[0]?.regionId ?? null);
		}
	}, [isSuper, regions, selectedRegionId]);

	const regionId = selectedRegionId ?? auth?.user?.regionId ?? 0;

	const {
		incidents,
		loading: incidentsLoading,
		error: incidentsError,
		refetch: incidentsRefetch,
	} = useIncidents(regionId, { enabled: true });
	const { showError } = useToast();

	const { filters, setFilters, filteredIncidents, clearAllFilters } = useIncidentFilters({
		incidents,
	});

	useEffect(() => {
		if (incidentsError) showError('Unable to load incidents.');
	}, [incidentsError, showError]);

	useEffect(() => {
		if (regionsError) showError('Unable to load regions.');
	}, [regionsError, showError]);

	const handleDetailsClick = (incident: Incident) => navigate(`/incidents/${incident.incidentId}`);

	const statusOrder: Record<Incident['status'], number> = {
		Open: 3,
		'In Progress': 2,
		Resolved: 1,
		Closed: 0,
	};

	const severityOrder: Record<Incident['severity'], number> = {
		Critical: 4,
		High: 3,
		Medium: 2,
		Low: 1,
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

				{isSuper && (
					<div className="mb-4">
						<SearchSelect
							items={regions}
							getId={r => r.regionId}
							getLabel={r => r.name}
							value={selectedRegionId}
							onChange={id => setSelectedRegionId(id)}
							placeholder="Region"
							className="w-64"
							inputClassName="pr-8"
						/>

						{regionsError && (
							<div className="mt-2">
								<ErrorRetryInline message="Unable to load regions" onRetry={() => fetchRegions()} />
							</div>
						)}
					</div>
				)}

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
