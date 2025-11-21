import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import { DEPARTMENT_ROLES } from '@/types/role';
import {
	useDeploymentRequest,
	useAssignResponseUnitToDeploymentRequest,
} from '@/hooks/useDeploymentRequest';
import { useResponseUnits } from '@/hooks/useResponseUnit';
import { useAuth } from '@/context/AuthContext';
import type { ResponseUnit } from '@/types/responseUnit';

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
	const auth = useAuth();
	const [selectedResponseUnit, setSelectedResponseUnit] = useState<ResponseUnit | null>(null);

	const {
		data: deploymentRequest,
		isLoading: loading,
		error: queryError,
		refetch,
	} = useDeploymentRequest(requestId);

	const assignMutation = useAssignResponseUnitToDeploymentRequest();

	// Get department response units for assignment
	const targetDepartmentId = deploymentRequest?.targetDepartmentId;
	const requestedUnitType = deploymentRequest?.requestedUnitType;

	// Fetch available response units for the target department
	const { data: allResponseUnits, isLoading: responseUnitsLoading } = useResponseUnits(
		targetDepartmentId,
		{
			enabled: !!targetDepartmentId && deploymentRequest?.status !== 'assigned',
		}
	);

	// Filter response units by the requested unit type and available status
	const availableResponseUnits =
		allResponseUnits?.filter(
			unit => unit.unitType === requestedUnitType && unit.status === 'AVAILABLE'
		) || [];

	const error = queryError?.message || null;

	useEffect(() => {
		showSingleError({
			key: `deploymentRequest.details.${requestId ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load deployment request.',
		});
	}, [error, loading, requestId, showSingleError]);

	const handleAssignment = async () => {
		if (!auth?.user?.userId || !requestId || !selectedResponseUnit) {
			return;
		}

		try {
			const payload = {
				requestId,
				assignedBy: auth.user.userId,
				assignedUnitId: selectedResponseUnit.unitId,
				notes: `Assigned ResponseUnit: ${selectedResponseUnit.unitName} (${selectedResponseUnit.unitType})`,
			};

			await assignMutation.mutateAsync(payload);

			// Reset selection
			setSelectedResponseUnit(null);

			// Refetch to get updated data
			refetch();
		} catch {
			// Error will be handled by the mutation's error state
		}
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
								<div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Response Unit</h3>

									{responseUnitsLoading ? (
										<LoadingPanel text="Loading available response units..." />
									) : (
										<div className="space-y-6">
											{/* Response Unit Selection */}
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Select {requestedUnitType} Response Unit{' '}
													<span className="text-red-500">*</span>
												</label>

												{availableResponseUnits.length === 0 ? (
													<div className="text-gray-500 italic space-y-2">
														<p>
															No available {requestedUnitType} response units in this department.
														</p>
														<div className="text-xs bg-gray-100 p-2 rounded">
															<p>Debug Info:</p>
															<p>Target Department ID: {targetDepartmentId}</p>
															<p>Requested Unit Type: &quot;{requestedUnitType}&quot;</p>
															<p>Total Units Found: {allResponseUnits?.length || 0}</p>
															<p>Available Units: {availableResponseUnits.length}</p>
														</div>
													</div>
												) : (
													<div className="space-y-3">
														{availableResponseUnits.map(unit => (
															<label
																key={unit.unitId}
																className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
															>
																<input
																	type="radio"
																	name="responseUnit"
																	checked={selectedResponseUnit?.unitId === unit.unitId}
																	onChange={() => setSelectedResponseUnit(unit)}
																	className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
																/>
																<div className="flex-1">
																	<div className="font-medium text-gray-900">{unit.unitName}</div>
																	<div className="text-sm text-gray-600">Type: {unit.unitType}</div>
																	{unit.defaultResources && unit.defaultResources.length > 0 && (
																		<div className="text-xs text-gray-500 mt-1">
																			Resources: {unit.defaultResources.length} configured
																		</div>
																	)}
																	{unit.defaultPersonnel && unit.defaultPersonnel.length > 0 && (
																		<div className="text-xs text-gray-500 mt-1">
																			Personnel:{' '}
																			{unit.defaultPersonnel.map(p => p.specialization).join(', ')}
																		</div>
																	)}
																</div>
															</label>
														))}
													</div>
												)}
											</div>

											{/* Assignment Button */}
											<div className="flex justify-end">
												<button
													onClick={handleAssignment}
													disabled={!selectedResponseUnit || assignMutation.isPending}
													className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{assignMutation.isPending ? 'Assigning...' : 'Assign Response Unit'}
												</button>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
