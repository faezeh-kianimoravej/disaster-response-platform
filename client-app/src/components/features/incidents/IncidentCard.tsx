import type { Incident, IncidentSeverity } from '@/types/incident';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Link } from 'react-router-dom';

interface IncidentCardProps {
	incident: Incident;
	onDetailsClick?: (incident: Incident) => void;
	onChatClick?: (incident: Incident) => void;
	// Optional customization for responder view
	primaryButtonText?: string;
	showTitleLink?: boolean;
}

const getSeverityVariant = (severity: IncidentSeverity): 'critical' | 'high' | 'medium' | 'low' => {
	switch (severity) {
		case 'CRITICAL':
			return 'critical';
		case 'HIGH':
			return 'high';
		case 'MEDIUM':
			return 'medium';
		case 'LOW':
			return 'low';
		default:
			return 'medium';
	}
};

const formatTime = (date: Date): string => {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	const timeStr = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

	// Less than 1 hour: show "Xm ago"
	if (diffMinutes < 60) {
		return `${diffMinutes}m ago`;
	}

	// Less than 24 hours: show "Xh ago"
	if (diffHours < 24) {
		return `${diffHours}h ago`;
	}

	// Yesterday: show "Yesterday HH:MM"
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	const isYesterday =
		date.getDate() === yesterday.getDate() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getFullYear() === yesterday.getFullYear();

	if (isYesterday) {
		return `Yesterday ${timeStr}`;
	}

	// Older than yesterday: show "DD/MM HH:MM"
	if (diffDays < 7) {
		const dateStr = date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });
		return `${dateStr} ${timeStr}`;
	}

	// Older than a week: show full date
	return date.toLocaleDateString('nl-NL', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

export default function IncidentCard({
	incident,
	onDetailsClick,
	onChatClick,
	primaryButtonText = 'Details',
	showTitleLink = true,
}: IncidentCardProps) {
	return (
		<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
			<h3 className="text-lg font-semibold text-gray-900 mb-3">
				{showTitleLink ? (
					<Link to={`/incidents/${incident.incidentId}`} className="hover:underline">
						{incident.title}
					</Link>
				) : (
					incident.title
				)}
			</h3>

			<div className="flex gap-2 mb-4">
				<Badge variant={getSeverityVariant(incident.severity)}>Priority: {incident.severity}</Badge>
				<Badge variant="default">GRIP: {incident.gripLevel}</Badge>
			</div>

			<p className="text-sm text-gray-600 mb-4">
				{incident.location} • {incident.status} • {formatTime(incident.reportedAt)}
			</p>

			<div className="flex gap-2">
				<Button
					variant="primary"
					className="flex-1 hover:bg-blue-700 transition-colors"
					onClick={() => onDetailsClick?.(incident)}
				>
					{primaryButtonText}
				</Button>
				<Button
					variant="outline"
					className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
					onClick={() => onChatClick?.(incident)}
				>
					Chat
				</Button>
			</div>
		</div>
	);
}
