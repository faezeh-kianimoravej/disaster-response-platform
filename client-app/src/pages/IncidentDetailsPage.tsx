import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Badge from '@/components/Badge';
import { getIncidentById } from '@/api/incident';
import type { Incident } from '@/types/incident';
import Button from '@/components/Button';

export default function IncidentDetailsPage() {
	const { incidentId } = useParams<{ incidentId: string }>();
	const navigate = useNavigate();
	const [incident, setIncident] = useState<Incident | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!incidentId) return;
		const id = Number(incidentId);
		const load = async () => {
			setLoading(true);
			const data = await getIncidentById(id);
			if (data) setIncident(data);
			setLoading(false);
		};
		load();
	}, [incidentId]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-xl">Loading incident...</div>
			</div>
		);
	}

	if (!incident) {
		return (
			<div className="max-w-4xl mx-auto p-8">
				<h2 className="text-2xl font-semibold mb-4">Incident not found</h2>
				<Button variant="outline" onClick={() => navigate('/')}>
					Back
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h1 className="text-2xl font-bold">Incident details</h1>
					</div>
					<Button variant="outline" onClick={() => navigate('/')}>
						Back
					</Button>
				</div>

				<div className="flex items-center justify-between mb-4">
					<div className="flex gap-3 items-center">
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

					<div className="flex items-center">
						<nav className="text-sm text-blue-600">
							<Link
								to={`/incidents/${incident.incidentId}/prioritize`}
								className="hover:text-blue-800 hover:underline"
							>
								Prioritize
							</Link>
							<span className="mx-2 text-gray-300">|</span>
							<a href="#" className="hover:text-blue-800 hover:underline">
								Instructions
							</a>
							<span className="mx-2 text-gray-300">|</span>
							<a href="#" className="hover:text-blue-800 hover:underline">
								Assign
							</a>
							<span className="mx-2 text-gray-300">|</span>
							<a href="#" className="hover:text-blue-800 hover:underline">
								Chat
							</a>
						</nav>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-3">{incident.title}</h3>

					<p className="text-sm text-gray-600 mb-4">
						{incident.location} • {incident.status}
					</p>

					<div className="mb-6">
						<div className="flex justify-between items-start mb-2">
							<div>
								<h4 className="font-semibold">Description</h4>
								<div className="text-sm text-gray-500">
									Reported at: {incident.reportedAt.toLocaleString()}
								</div>
							</div>
						</div>

						<div className="p-4 bg-white text-gray-800 rounded border border-gray-200 shadow-sm min-h-[200px]">
							{incident.description ? (
								<div className="whitespace-pre-wrap">{incident.description}</div>
							) : (
								<span className="text-gray-500">No description provided.</span>
							)}
						</div>
					</div>

					{/* Map and resources omitted as requested */}
				</div>
			</div>
		</div>
	);
}
