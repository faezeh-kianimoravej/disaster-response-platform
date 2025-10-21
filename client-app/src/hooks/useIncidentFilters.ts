import { useState, useMemo } from 'react';
import type { Incident } from '@/types/incident';

interface UseIncidentFiltersProps {
	incidents: Incident[];
}

export function useIncidentFilters({ incidents }: UseIncidentFiltersProps) {
	const [statusFilter, setStatusFilter] = useState<string>('');
	const [priorityFilter, setPriorityFilter] = useState<string>('');
	const [gripFilter, setGripFilter] = useState<string>('');
	const [timeFilter, setTimeFilter] = useState<string>('');
	const [searchQuery, setSearchQuery] = useState<string>('');

	const filteredIncidents = useMemo(() => {
		return incidents.filter(incident => {
			// Status filter
			if (statusFilter && incident.status !== statusFilter) return false;

			// Priority filter
			if (priorityFilter && incident.severity !== priorityFilter) return false;

			// GRIP filter
			if (gripFilter && incident.gripLevel.toString() !== gripFilter) return false;

			// Time filter
			if (timeFilter) {
				const now = new Date();
				const incidentTime = incident.reportedAt;
				const diffMinutes = (now.getTime() - incidentTime.getTime()) / (1000 * 60);

				switch (timeFilter) {
					case 'last15':
						if (diffMinutes > 15) return false;
						break;
					case 'last30':
						if (diffMinutes > 30) return false;
						break;
					case 'last1h':
						if (diffMinutes > 60) return false;
						break;
					case 'last3h':
						if (diffMinutes > 180) return false;
						break;
					case 'last6h':
						if (diffMinutes > 360) return false;
						break;
					case 'last24h':
						if (diffMinutes > 1440) return false;
						break;
					case 'today':
						const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
						if (incidentTime < today) return false;
						break;
				}
			}

			// Search query filter
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					incident.title.toLowerCase().includes(query) ||
					incident.location.toLowerCase().includes(query) ||
					incident.description.toLowerCase().includes(query)
				);
			}

			return true;
		});
	}, [incidents, statusFilter, priorityFilter, gripFilter, timeFilter, searchQuery]);

	const clearAllFilters = () => {
		setStatusFilter('');
		setPriorityFilter('');
		setGripFilter('');
		setTimeFilter('');
		setSearchQuery('');
	};

	return {
		filters: {
			statusFilter,
			priorityFilter,
			gripFilter,
			timeFilter,
			searchQuery,
		},
		setFilters: {
			setStatusFilter,
			setPriorityFilter,
			setGripFilter,
			setTimeFilter,
			setSearchQuery,
		},
		clearAllFilters,
		filteredIncidents,
	};
}
