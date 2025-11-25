import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import { useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import { DEPARTMENT_ROLES } from '@/types/role';
import { useDeploymentRequest } from '@/hooks/useDeploymentRequest';
import FillUnitAssignmentPanel from '@/components/forms/FillUnitAssignmentPanel';

export default function DeploymentRequestDetailsPage() {
	const { requestId } = useParams<{ requestId: string }>();
	const id = requestId ? Number(requestId) : undefined;

	return (
		<AuthGuard requireRoles={[...DEPARTMENT_ROLES]}>
			<DeploymentRequestDetailsPageContent requestId={id} />
		</AuthGuard>
	);
}

function DeploymentRequestDetailsPageContent({
	requestId,
}: {
	requestId?: number | undefined;
}): JSX.Element {
	const navigate = useNavigate();
	const showSingleError = useSingleErrorToast();

	debugger;
	const {
		data: deploymentRequest,
		isLoading: loading,
		error: queryError,
		refetch,
	} = useDeploymentRequest(requestId);

	const error = queryError?.message || null;

	useEffect(() => {
		showSingleError({
			key: `deploymentRequest.details.${requestId ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load deployment request.',
		});
	}, [error, loading, requestId, showSingleError]);

	const getStatusBadgeVariant = (status: string) => {
		switch (status?.toUpperCase()) {
			case 'PENDING':
				return 'medium';
			case 'ASSIGNED':
				return 'low';
			case 'DECLINED':
				return 'critical';
			case 'CANCELLED':
				return 'default';
			default:
				return 'default';
		}
	};

	const getPriorityBadgeVariant = (priority: string) => {
		switch (priority?.toUpperCase()) {
			case 'CRITICAL':
				return 'critical';
			case 'HIGH':
				return 'high';
			case 'MEDIUM':
				return 'medium';
			case 'LOW':
				return 'low';
			default:
				return 'default';
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Deployment Request Details</h1>
					<div className="flex space-x-3">
						<Button variant="outline" onClick={() => navigate(routes.dashboard())}>
							Back
						</Button>
					</div>
				</div>

				<section aria-busy={loading} aria-live="polite">
					{loading && <LoadingPanel text="Loading deployment request..." />}

					{error && !loading && (
						<div className="mb-6">
							<ErrorRetryBlock
								message="Unable to load deployment request."
								onRetry={() => refetch()}
							/>
						</div>
					)}

					{!loading && !error && !deploymentRequest && (
						<div className="bg-white rounded-lg shadow-md p-8 text-center">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Deployment request not found
							</h2>
							<p className="text-gray-600 mb-6">
								The requested deployment request could not be found or may have been removed.
							</p>
							<Button variant="outline" onClick={() => navigate(routes.dashboard())}>
								Return to Dashboard
							</Button>
						</div>
					)}

					{!loading && !error && deploymentRequest && (
						<div className="bg-white rounded-lg shadow-md p-6">
							{/* Header with Status and Priority */}
							<div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
								<div className="flex items-center gap-3">
									<Badge
										variant={getStatusBadgeVariant(deploymentRequest.status)}
										className="text-sm"
									>
										{deploymentRequest.status}
									</Badge>
									<Badge
										variant={getPriorityBadgeVariant(deploymentRequest.priority)}
										className="text-sm"
									>
										{deploymentRequest.priority} Priority
									</Badge>
								</div>
							</div>

							{/* Request Information */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<p className="text-sm font-medium text-gray-500">Requested At</p>
											<p className="text-gray-900">
												{deploymentRequest.requestedAt
													? typeof deploymentRequest.requestedAt === 'string'
														? new Date(deploymentRequest.requestedAt).toLocaleString()
														: deploymentRequest.requestedAt.toLocaleString()
													: 'N/A'}
											</p>
										</div>
									</div>

									<div className="space-y-4">
										{deploymentRequest.assignedAt && (
											<div>
												<p className="text-sm font-medium text-gray-500">Assigned At</p>
												<p className="text-gray-900">
													{typeof deploymentRequest.assignedAt === 'string'
														? new Date(deploymentRequest.assignedAt).toLocaleString()
														: deploymentRequest.assignedAt.toLocaleString()}
												</p>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Requested Units */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Requested Units</h3>
								<div className="bg-gray-50 rounded-lg p-4">
									<div className="overflow-x-auto">
										<table className="min-w-full">
											<thead>
												<tr className="border-b border-gray-200">
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Unit Type
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Quantity
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Status
													</th>
													<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Assigned Unit
													</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td className="px-4 py-3 text-sm font-medium text-gray-900">
														{deploymentRequest.requestedUnitType}
													</td>
													<td className="px-4 py-3 text-sm text-gray-900">
														{deploymentRequest.requestedQuantity}
													</td>
													<td className="px-4 py-3">
														<Badge
															variant={getStatusBadgeVariant(deploymentRequest.status)}
															className="text-xs"
														>
															{deploymentRequest.status.toUpperCase()}
														</Badge>
													</td>
													<td className="px-4 py-3 text-sm text-gray-900">
														{deploymentRequest.assignedUnitId ? (
															<span className="font-medium">
																Unit #{deploymentRequest.assignedUnitId}
															</span>
														) : (
															<span className="text-gray-500 italic">Not assigned</span>
														)}
													</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</div>

							{/* Assignment Panel - Show if status is not assigned */}
							{deploymentRequest.status !== 'assigned' && (
								<FillUnitAssignmentPanel
									deploymentRequest={deploymentRequest}
									onAssignmentSuccess={() => refetch()}
								/>
							)}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
