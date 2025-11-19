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
import { useDeploymentRequest, useAssignDeploymentRequest } from '@/hooks/useDeploymentRequest';
import { useResources } from '@/hooks/useResource';
import { useUsersByDepartment } from '@/hooks/useUser';
import { useAuth } from '@/context/AuthContext';
import type { Resource } from '@/types/resource';
import type { User } from '@/types/user';

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
	const [selectedResources, setSelectedResources] = useState<
		Array<{ resource: Resource; quantity: number }>
	>([]);
	const [selectedPersonnel, setSelectedPersonnel] = useState<User[]>([]);

	const {
		data: deploymentRequest,
		isLoading: loading,
		error: queryError,
		refetch,
	} = useDeploymentRequest(requestId);

	const assignMutation = useAssignDeploymentRequest();

	// Get department resources and users for assignment
	const targetDepartmentId = deploymentRequest?.targetDepartmentId;
	const requestedUnitType = deploymentRequest?.requestedUnitType;
	const requestedQuantity = deploymentRequest?.requestedQuantity || 1;

	// For TEAM requests, fetch TEAM resources. For others, fetch resources of the matching type
	const isTeamRequest = requestedUnitType === 'Team';

	// Always fetch resources (for both TEAM and non-TEAM requests)
	const { resources, loading: resourcesLoading } = useResources(targetDepartmentId, {
		enabled: !!targetDepartmentId && deploymentRequest?.status !== 'assigned',
	});

	// Only fetch users for non-TEAM requests (for optional personnel assignment)
	const { users: departmentUsers, loading: usersLoading } = useUsersByDepartment(
		targetDepartmentId,
		{
			enabled: !!targetDepartmentId && deploymentRequest?.status !== 'assigned' && !isTeamRequest,
		}
	);

	// Filter resources by the requested unit type for non-TEAM requests
	// Map ResponseUnitType to ResourceType for filtering
	const getResourceTypeFromUnitType = (unitType: string) => {
		// If the unitType is already in RESOURCE_TYPE format (uppercase with underscores), return as-is
		const resourceTypeFormat = /^[A-Z_]+$/.test(unitType);
		if (resourceTypeFormat) {
			return unitType;
		}

		// Otherwise, map from display format to resource type format
		const mapping: Record<string, string> = {
			'Command vehicle': 'COMMAND_VEHICLE',
			Team: 'TEAM',
			Boat: 'BOAT',
			Helicopter: 'HELICOPTER',
			Drone: 'DRONE',
			'Fire truck': 'FIRE_TRUCK',
			'Ladder truck': 'LADDER_TRUCK',
			Ambulance: 'AMBULANCE',
			'Trauma helicopter': 'TRAUMA_HELICOPTER',
			'Patrol car': 'PATROL_CAR',
			'SWAT car': 'SWAT_CAR',
			'Armored vehicle': 'ARMORED_VEHICLE',
			'Transport truck': 'TRANSPORT_TRUCK',
			'Rescue vehicle': 'RESCUE_VEHICLE',
			'Water tanker': 'WATER_TANKER',
		};
		return mapping[unitType] || unitType;
	};

	// Filter resources based on request type
	const filteredResources = resources.filter(
		resource => resource.resourceType === getResourceTypeFromUnitType(requestedUnitType || '')
	);

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
		if (!auth?.user?.userId || !requestId) {
			return;
		}

		// Validate selection - all requests now use resources
		if (selectedResources.length === 0) {
			return;
		}

		// Check total quantity doesn't exceed requested
		const totalQuantity = selectedResources.reduce((sum, item) => sum + item.quantity, 0);
		if (totalQuantity > requestedQuantity) {
			return;
		}

		try {
			const payload: {
				requestId: number;
				assignedBy: number;
				assignedUsers: number[];
				assignedResources: {
					resourceId: number;
					quantity: number;
				}[];
				notes: string;
			} = {
				requestId,
				assignedBy: auth.user.userId,
				assignedResources: selectedResources.map(item => ({
					resourceId: item.resource.resourceId,
					quantity: item.quantity,
				})),
				assignedUsers: [], // Will be set below
				notes: `Assigned resources: ${selectedResources.map(item => `${item.resource.name} (${item.quantity})`).join(', ')}`,
			};

			// For non-TEAM requests, include optional personnel if selected
			if (!isTeamRequest && selectedPersonnel.length > 0) {
				payload.assignedUsers = selectedPersonnel.map(p => p.userId);
				payload.notes += ` with personnel: ${selectedPersonnel.map(p => `${p.firstName} ${p.lastName}`).join(', ')}`;
			} else {
				payload.assignedUsers = [];
			}

			await assignMutation.mutateAsync(payload);

			// Reset selections
			setSelectedResources([]);
			setSelectedPersonnel([]);

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
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										{isTeamRequest ? 'Assign Team Resources' : 'Assign Resources'}
									</h3>

									{resourcesLoading || (usersLoading && !isTeamRequest) ? (
										<LoadingPanel text="Loading assignment options..." />
									) : (
										<div className="space-y-6">
											{/* Resource Selection - Always shown for both TEAM and non-TEAM */}
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Select {isTeamRequest ? 'Team' : requestedUnitType} Resources{' '}
													<span className="text-red-500">*</span>
													<span className="text-sm text-gray-500 ml-2">
														(Total quantity:{' '}
														{selectedResources.reduce((sum, item) => sum + item.quantity, 0)} of{' '}
														{requestedQuantity})
													</span>
												</label>

												{filteredResources.length === 0 ? (
													<div className="text-gray-500 italic space-y-2">
														<p>No {requestedUnitType} resources available in this department.</p>
														{/* Debug info */}
														<div className="text-xs bg-gray-100 p-2 rounded">
															<p>Debug Info:</p>
															<p>Requested Unit Type: &quot;{requestedUnitType}&quot;</p>
															<p>
																Mapped Resource Type: &quot;
																{getResourceTypeFromUnitType(requestedUnitType || '')}&quot;
															</p>
															<p>Total Resources in Department: {resources.length}</p>
															<p>
																Available Resource Types:{' '}
																{resources.map(r => r.resourceType).join(', ')}
															</p>
														</div>
													</div>
												) : (
													<div className="space-y-4">
														{filteredResources.map(resource => {
															const currentSelection = selectedResources.find(
																item => item.resource.resourceId === resource.resourceId
															);
															const selectedQuantity = currentSelection?.quantity || 0;
															const maxAvailable = Math.min(
																resource.availableQuantity || 1,
																requestedQuantity -
																	selectedResources.reduce(
																		(sum, item) =>
																			item.resource.resourceId === resource.resourceId
																				? sum
																				: sum + item.quantity,
																		0
																	)
															);

															return (
																<div
																	key={resource.resourceId}
																	className="border border-gray-200 rounded-md p-4"
																>
																	<div className="flex justify-between items-start mb-2">
																		<div>
																			<h4 className="font-medium">{resource.name}</h4>
																			<p className="text-sm text-gray-600">
																				{resource.resourceType}
																				{resource.availableQuantity !== undefined &&
																					` (Available: ${resource.availableQuantity})`}
																			</p>
																		</div>
																	</div>

																	<div className="flex items-center space-x-3">
																		<label className="text-sm font-medium">Quantity:</label>
																		<input
																			type="number"
																			min="0"
																			max={maxAvailable}
																			value={selectedQuantity}
																			onChange={e => {
																				const newQuantity = Math.max(
																					0,
																					parseInt(e.target.value) || 0
																				);
																				setSelectedResources(prev => {
																					const filtered = prev.filter(
																						item => item.resource.resourceId !== resource.resourceId
																					);
																					if (newQuantity > 0) {
																						return [
																							...filtered,
																							{ resource, quantity: newQuantity },
																						];
																					}
																					return filtered;
																				});
																			}}
																			className="w-20 p-1 border border-gray-300 rounded text-center"
																		/>
																	</div>
																</div>
															);
														})}
													</div>
												)}
											</div>

											{/* Personnel Selection - Only for non-TEAM requests */}
											{!isTeamRequest && (
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Select Personnel
													</label>

													<div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
														{departmentUsers?.map(user => (
															<label key={user.userId} className="flex items-center space-x-3">
																<input
																	type="checkbox"
																	checked={selectedPersonnel.some(p => p.userId === user.userId)}
																	onChange={e => {
																		if (e.target.checked) {
																			setSelectedPersonnel(prev => [...prev, user]);
																		} else {
																			setSelectedPersonnel(prev =>
																				prev.filter(p => p.userId !== user.userId)
																			);
																		}
																	}}
																	className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
																/>
																<span className="text-sm">
																	{user.firstName} {user.lastName} - {user.email}
																</span>
															</label>
														))}
													</div>
												</div>
											)}

											{/* Assignment Button */}
											<div className="flex justify-end">
												<button
													onClick={handleAssignment}
													disabled={
														selectedResources.length === 0 ||
														selectedResources.reduce((sum, item) => sum + item.quantity, 0) === 0
													}
													className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													Assign
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
