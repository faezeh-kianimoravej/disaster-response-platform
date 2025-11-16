import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import { useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import { REGION_ROLES } from '@/types/role';
import { useDeploymentRequest } from '@/hooks/useDeploymentOrder';

export default function DeploymentRequestDetailsPage() {
	const { requestId } = useParams<{ requestId: string }>();
	const navigate = useNavigate();
	const showSingleError = useSingleErrorToast();

	const id = requestId ? Number(requestId) : undefined;

	const {
		data: deploymentRequest,
		isLoading: loading,
		error: queryError,
		refetch: fetchDeploymentRequest,
	} = useDeploymentRequest(id);

	const error = queryError?.message || null;

	useEffect(() => {
		showSingleError({
			key: `deploymentRequest.details.${id ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load deployment request.',
		});
	}, [error, loading, id, showSingleError]);

	const handleEdit = () => {
		// TODO: Implement edit deployment request API integration
		// Navigate to edit form or open modal for editing deployment request
	};

	const handleDecline = () => {
		// TODO: Implement decline deployment request API integration
		// Call API to decline the request and show success/error feedback
	};

	const handleAssign = () => {
		// TODO: Implement assign deployment request navigation
		// Navigate to assignment/allocation page
		navigate(`/deployment-requests/${id}/allocate`);
	};

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
		<AuthGuard requireRoles={[...REGION_ROLES]}>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-5xl mx-auto px-4">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">Deployment Request Details</h1>
						</div>
						<Button variant="outline" onClick={() => navigate(routes.dashboard())}>
							Back
						</Button>
					</div>

					{loading && <LoadingPanel text="Loading deployment request..." className="mb-6" />}

					{error && !loading && (
						<ErrorRetryBlock
							message="Unable to load deployment request."
							onRetry={() => fetchDeploymentRequest()}
						/>
					)}

					{!loading && !error && !deploymentRequest && (
						<div className="max-w-4xl mx-auto p-8">
							<h2 className="text-2xl font-semibold mb-4">Deployment request not found</h2>
							<Button variant="outline" onClick={() => navigate(routes.home())}>
								Back
							</Button>
						</div>
					)}

					{!loading && !error && deploymentRequest && (
						<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
							<div className="flex items-center justify-between mb-4">
								<div className="flex gap-3 items-center">
									<Badge
										variant={getStatusBadgeVariant(deploymentRequest.status)}
										className="text-sm"
									>
										Status: {deploymentRequest.status}
									</Badge>
									<Badge
										variant={getPriorityBadgeVariant(deploymentRequest.priority)}
										className="text-sm"
									>
										Priority: {deploymentRequest.priority}
									</Badge>
								</div>

								<div className="flex items-center">
									<nav className="text-sm text-blue-600">
										{deploymentRequest.incidentId && (
											<>
												<button
													onClick={() => navigate(routes.incident(deploymentRequest.incidentId!))}
													className="hover:text-blue-800 hover:underline"
												>
													View Incident
												</button>
												<span className="mx-2 text-gray-300">|</span>
											</>
										)}
										<button onClick={handleAssign} className="hover:text-blue-800 hover:underline">
											Assign
										</button>
										<span className="mx-2 text-gray-300">|</span>
										<button onClick={handleDecline} className="hover:text-blue-800 hover:underline">
											Decline
										</button>
										<span className="mx-2 text-gray-300">|</span>
										<button onClick={handleEdit} className="hover:text-blue-800 hover:underline">
											Edit
										</button>
									</nav>
								</div>
							</div>

							<h3 className="text-lg font-semibold text-gray-900 mb-3">
								Deployment Request #{deploymentRequest.requestId}
							</h3>

							<p className="text-sm text-gray-600 mb-4">
								Incident ID: {deploymentRequest.incidentId} • Target Department:{' '}
								{deploymentRequest.targetDepartmentId}
							</p>

							<div className="mb-6">
								<div className="flex justify-between items-start mb-2">
									<div>
										<h4 className="font-semibold">Request Details</h4>
										<div className="text-sm text-gray-500">
											Requested at:{' '}
											{deploymentRequest.requestedAt
												? typeof deploymentRequest.requestedAt === 'string'
													? new Date(deploymentRequest.requestedAt).toLocaleString()
													: deploymentRequest.requestedAt.toLocaleString()
												: ''}
										</div>
									</div>
								</div>

								<div className="p-4 bg-white text-gray-800 rounded border border-gray-200 shadow-sm min-h-[200px]">
									{/* Request Information */}
									<div className="grid grid-cols-2 gap-6 mb-6">
										<div>
											<div className="mb-4">
												<p className="text-sm font-medium text-gray-500 mb-1">Requested By</p>
												<p className="text-base text-gray-900">
													User #{deploymentRequest.requestedBy}
												</p>
											</div>
											<div className="mb-4">
												<p className="text-sm font-medium text-gray-500 mb-1">
													Deployment Order ID
												</p>
												<p className="text-base text-gray-900">
													#{deploymentRequest.deploymentOrderId}
												</p>
											</div>
										</div>
										<div>
											{deploymentRequest.assignedBy && (
												<div className="mb-4">
													<p className="text-sm font-medium text-gray-500 mb-1">Assigned By</p>
													<p className="text-base text-gray-900">
														User #{deploymentRequest.assignedBy}
													</p>
												</div>
											)}
											{deploymentRequest.assignedAt && (
												<div className="mb-4">
													<p className="text-sm font-medium text-gray-500 mb-1">Assigned At</p>
													<p className="text-base text-gray-900">
														{typeof deploymentRequest.assignedAt === 'string'
															? new Date(deploymentRequest.assignedAt).toLocaleString()
															: deploymentRequest.assignedAt.toLocaleString()}
													</p>
												</div>
											)}
											{!deploymentRequest.assignedBy && !deploymentRequest.assignedAt && (
												<div className="text-gray-500 italic">No assignment details yet</div>
											)}
										</div>
									</div>

									{/* Requested Units Table */}
									<div>
										<h5 className="text-base font-semibold text-gray-900 mb-3">Requested Units</h5>
										<div className="overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-200">
												<thead>
													<tr>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
															Unit Type
														</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
															Quantity
														</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
															Status
														</th>
														<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
															Assigned Unit
														</th>
													</tr>
												</thead>
												<tbody>
													<tr className="hover:bg-gray-50">
														<td className="px-4 py-2 text-sm text-gray-900 font-medium">
															{deploymentRequest.requestedUnitType}
														</td>
														<td className="px-4 py-2 text-sm text-gray-900">
															{deploymentRequest.requestedQuantity}
														</td>
														<td className="px-4 py-2">
															<Badge
																variant={getStatusBadgeVariant(deploymentRequest.status)}
																className="text-xs"
															>
																{deploymentRequest.status.toUpperCase()}
															</Badge>
														</td>
														<td className="px-4 py-2 text-sm text-gray-900">
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
							</div>

							{/* Action Buttons */}
							<div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
								<Button variant="outline" onClick={handleEdit}>
									Edit Request
								</Button>
								<Button variant="danger" onClick={handleDecline}>
									Decline
								</Button>
								<Button variant="primary" onClick={handleAssign}>
									Assign
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</AuthGuard>
	);
}
