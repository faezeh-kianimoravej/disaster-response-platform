import { Link, useParams, useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import { useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import { useIncident } from '@/hooks/useIncident';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import { REGION_ROLES } from '@/types/role';

export default function IncidentDetailsPage() {
	const { incidentId } = useParams<{ incidentId: string }>();
	const navigate = useNavigate();
	const showSingleError = useSingleErrorToast();

	const id = incidentId ? Number(incidentId) : undefined;
	const { incident, loading, error, fetchIncident } = useIncident(id);

	useEffect(() => {
		showSingleError({
			key: `incident.details.${id ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load incident.',
		});
	}, [error, loading, id, showSingleError]);

	return (
		<AuthGuard requireRoles={[...REGION_ROLES]} requireAccessToRegion={incident?.regionId}>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-5xl mx-auto px-4">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">Incident details</h1>
						</div>
						<Button variant="outline" onClick={() => navigate(routes.home())}>
							Back
						</Button>
					</div>

					{loading && <LoadingPanel text="Loading incident..." className="mb-6" />}

					{error && !loading && (
						<ErrorRetryBlock message="Unable to load incident." onRetry={() => fetchIncident?.()} />
					)}

					{!loading && !error && !incident && (
						<div className="max-w-4xl mx-auto p-8">
							<h2 className="text-2xl font-semibold mb-4">Incident not found</h2>
							<Button variant="outline" onClick={() => navigate(routes.home())}>
								Back
							</Button>
						</div>
					)}

					{!loading && !error && incident && (
						<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
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
											to={routes.incidentPrioritize(incident.incidentId)}
											className="hover:text-blue-800 hover:underline"
										>
											Prioritize
										</Link>
										<span className="mx-2 text-gray-300">|</span>

										<Link
											to={`/incidents/${incident.incidentId}/allocate-resources`}
											className="hover:text-blue-800 hover:underline"
										>
											Allocate Resources
										</Link>										
										<span className="mx-2 text-gray-300">|</span>
										<a href="#" className="hover:text-blue-800 hover:underline">
											Instructions
										</a>
										<span className="mx-2 text-gray-300">|</span>
										<a href="#" className="hover:text-blue-800 hover:underline">
											Chat
										</a>
									</nav>
								</div>
							</div>

							<h3 className="text-lg font-semibold text-gray-900 mb-3">{incident.title}</h3>

							<p className="text-sm text-gray-600 mb-4">
								{incident.location} • {incident.status}
							</p>

							<div className="mb-6">
								<div className="flex justify-between items-start mb-2">
									<div>
										<h4 className="font-semibold">Description</h4>
										<div className="text-sm text-gray-500">
											Reported at:{' '}
											{incident.reportedAt
												? typeof incident.reportedAt === 'string'
													? new Date(incident.reportedAt).toLocaleString()
													: incident.reportedAt.toLocaleString()
												: ''}
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
					)}
				</div>
			</div>
		</AuthGuard>
	);
}
