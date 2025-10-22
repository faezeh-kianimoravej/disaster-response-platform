import { useEffect, useState } from 'react';
import { getIncidents } from '@/api/incident';
import type { Incident } from '@/types/incident';
import IncidentCard from '@/components/IncidentCard';
import IncidentFilters from '@/components/IncidentFilters';
import { useIncidentFilters } from '@/hooks/useIncidentFilters';

export default function HomePage() {
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [loading, setLoading] = useState(true);

	const { filters, setFilters, filteredIncidents, clearAllFilters } = useIncidentFilters({
		incidents,
	});

	useEffect(() => {
		loadIncidents();
	}, []);

	const loadIncidents = async () => {
		try {
			setLoading(true);
			const data = await getIncidents();
			setIncidents(data);
		} catch (error) {
			console.error('Failed to load incidents:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDetailsClick = (incident: Incident) => {
		console.log('Details clicked for incident:', incident.incidentId);
		// TODO: Navigate to incident details page or open modal
	};

	const handleChatClick = (incident: Incident) => {
		console.log('Chat clicked for incident:', incident.incidentId);
		// TODO: Open chat interface for incident
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-xl">Loading incidents...</div>
			</div>
		);
	}

	// Define ordering preferences
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

	// Exclude closed and compute final ordering by status then severity
	const visibleIncidents = filteredIncidents
		.filter(i => i.status !== 'Closed')
		.sort((a, b) => {
			// Sort by status precedence first
			const statusDiff = statusOrder[b.status] - statusOrder[a.status];
			if (statusDiff !== 0) return statusDiff;
			// Then by severity importance
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

				{/* Open incidents */}
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
									onChatClick={handleChatClick}
								/>
							))}
						</div>
					</>
				)}

				{/* Separator between Open and the rest if both exist */}
				{openIncidents.length > 0 && otherIncidents > 0 && (
					<hr className="my-6 border-t border-gray-200" />
				)}

				{/* In Progress incidents */}
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
									onChatClick={handleChatClick}
								/>
							))}
						</div>
					</>
				)}

				{/* Resolved incidents */}
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
									onChatClick={handleChatClick}
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
			</div>
		</div>
	);
}
