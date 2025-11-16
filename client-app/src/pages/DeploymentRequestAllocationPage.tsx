import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { routes } from '@/routes';
import Badge from '@/components/ui/Badge';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import { REGION_ROLES } from '@/types/role';
import {
	useDeploymentRequest,
	useAvailableUsersForUnit,
	useAvailableResourcesForUnit,
	useAssignDeploymentRequest,
} from '@/hooks/useDeploymentOrder';
import { useToast } from '@/components/toast/ToastProvider';
import { useAuth } from '@/context/AuthContext';
import { deploymentAllocationSchema } from '@/validation/deploymentAllocationValidation';
import { ZodError } from 'zod';
import type { User } from '@/types/user';
import type { Resource } from '@/types/resource';

interface AllocationSelection {
	selectedUsers: number[];
	selectedResources: { resourceId: number; quantity: number }[];
}

export default function DeploymentRequestAllocationPage() {
	const { requestId } = useParams<{ requestId: string }>();
	const navigate = useNavigate();
	const auth = useAuth();
	const { showToast } = useToast();
	const showSingleError = useSingleErrorToast();
	const queryClient = useQueryClient();

	const id = requestId ? Number(requestId) : undefined;

	const {
		data: deploymentRequest,
		isLoading: requestLoading,
		error: requestError,
		refetch: fetchDeploymentRequest,
	} = useDeploymentRequest(id);

	const {
		data: users = [],
		isLoading: usersLoading,
		error: usersError,
		refetch: fetchUsers,
	} = useAvailableUsersForUnit(
		deploymentRequest?.targetDepartmentId,
		deploymentRequest?.requestedUnitType,
		{
			enabled:
				!!deploymentRequest?.targetDepartmentId &&
				!!deploymentRequest?.requestedUnitType &&
				!requestLoading &&
				!requestError,
		}
	);

	const {
		data: resources = [],
		isLoading: resourcesLoading,
		error: resourcesError,
		refetch: fetchResources,
	} = useAvailableResourcesForUnit(
		deploymentRequest?.targetDepartmentId,
		deploymentRequest?.requestedUnitType,
		{
			enabled:
				!!deploymentRequest?.targetDepartmentId &&
				!!deploymentRequest?.requestedUnitType &&
				!requestLoading &&
				!requestError,
		}
	);

	const assignmentMutation = useAssignDeploymentRequest();

	const [allocation, setAllocation] = useState<AllocationSelection>({
		selectedUsers: [],
		selectedResources: [],
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	const requestErrorMessage = requestError?.message || null;
	const usersErrorMessage = usersError?.message || null;
	const resourcesErrorMessage = resourcesError?.message || null;

	useEffect(() => {
		showSingleError({
			key: `deploymentRequest.allocation.${id ?? 'unknown'}`,
			error: requestErrorMessage,
			loading: requestLoading,
			message: 'Unable to load deployment request.',
		});
	}, [requestErrorMessage, requestLoading, id, showSingleError]);

	useEffect(() => {
		showSingleError({
			key: `users.allocation.${deploymentRequest?.targetDepartmentId ?? 'unknown'}.${deploymentRequest?.requestedUnitType ?? 'unknown'}`,
			error: usersErrorMessage,
			loading: usersLoading,
			message: 'Unable to load available users.',
		});
	}, [
		usersErrorMessage,
		usersLoading,
		deploymentRequest?.targetDepartmentId,
		deploymentRequest?.requestedUnitType,
		showSingleError,
	]);

	useEffect(() => {
		showSingleError({
			key: `resources.allocation.${deploymentRequest?.targetDepartmentId ?? 'unknown'}.${deploymentRequest?.requestedUnitType ?? 'unknown'}`,
			error: resourcesErrorMessage,
			loading: resourcesLoading,
			message: 'Unable to load available resources.',
		});
	}, [
		resourcesErrorMessage,
		resourcesLoading,
		deploymentRequest?.targetDepartmentId,
		deploymentRequest?.requestedUnitType,
		showSingleError,
	]);

	const handleUserToggle = (userId: number) => {
		setAllocation(prev => ({
			...prev,
			selectedUsers: prev.selectedUsers.includes(userId)
				? prev.selectedUsers.filter(id => id !== userId)
				: [...prev.selectedUsers, userId],
		}));
	};

	const handleResourceQuantityChange = (resourceId: number, quantity: number) => {
		setAllocation(prev => ({
			...prev,
			selectedResources:
				quantity > 0
					? [
							...prev.selectedResources.filter(r => r.resourceId !== resourceId),
							{ resourceId, quantity },
						]
					: prev.selectedResources.filter(r => r.resourceId !== resourceId),
		}));
	};

	const handleSubmitAllocation = async () => {
		if (!deploymentRequest || !auth?.user) return;

		// Prepare allocation data
		const allocationData = {
			requestId: deploymentRequest.requestId,
			assignedBy: auth.user.userId,
			assignedUsers: allocation.selectedUsers.length > 0 ? allocation.selectedUsers : undefined,
			assignedResources:
				allocation.selectedResources.length > 0 ? allocation.selectedResources : undefined,
		};

		// Validate allocation data
		try {
			deploymentAllocationSchema.parse(allocationData);
		} catch (validationError: unknown) {
			// Extract the first validation error message for user feedback
			if (validationError instanceof ZodError && validationError.errors.length > 0) {
				const firstError = validationError.errors[0];
				const errorMessage = firstError?.message || 'Invalid allocation data';
				showToast(errorMessage, 'error');
			} else {
				showToast('Invalid allocation data', 'error');
			}
			return;
		}

		setIsSubmitting(true);
		try {
			await assignmentMutation.mutateAsync({
				requestId: deploymentRequest.requestId,
				assignedBy: auth.user.userId,
				assignedUsers: allocation.selectedUsers,
				assignedResources: allocation.selectedResources,
			});

			// Invalidate the deployment request cache so the details page refreshes
			await queryClient.invalidateQueries({
				queryKey: ['deployment-request', id],
			});

			showToast('Allocation submitted successfully', 'success');
			navigate(`/deployment-requests/${id}`);
		} catch {
			showToast('Failed to submit allocation', 'error');
		} finally {
			setIsSubmitting(false);
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

	const availableUsers =
		users?.filter((user: User) => user.responderProfile?.primarySpecialization) || [];

	const availableResources =
		resources?.filter((resource: Resource) => resource.status === 'AVAILABLE') || [];

	const isValidAllocation =
		allocation.selectedUsers.length > 0 || allocation.selectedResources.length > 0;

	return (
		<AuthGuard requireRoles={[...REGION_ROLES]}>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-5xl mx-auto px-4">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">Allocation - Deployment Request</h1>
						</div>
						<Button variant="outline" onClick={() => navigate(`/deployment-requests/${id}`)}>
							Back
						</Button>
					</div>

					{requestLoading && <LoadingPanel text="Loading deployment request..." className="mb-6" />}

					{requestErrorMessage && !requestLoading && (
						<ErrorRetryBlock
							message="Unable to load deployment request."
							onRetry={() => fetchDeploymentRequest()}
						/>
					)}

					{!requestLoading && !requestErrorMessage && !deploymentRequest && (
						<div className="max-w-4xl mx-auto p-8">
							<h2 className="text-2xl font-semibold mb-4">Deployment request not found</h2>
							<Button variant="outline" onClick={() => navigate(routes.dashboard())}>
								Back to Dashboard
							</Button>
						</div>
					)}

					{!requestLoading && !requestErrorMessage && deploymentRequest && (
						<div className="space-y-6">
							{/* Request Summary */}
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
								</div>

								<h3 className="text-lg font-semibold text-gray-900 mb-3">
									Deployment Request #{deploymentRequest.requestId}
								</h3>

								<div className="grid grid-cols-2 gap-6 text-sm">
									<div>
										<p className="text-gray-500">Requested Unit Type:</p>
										<p className="font-medium">{deploymentRequest.requestedUnitType}</p>
									</div>
									<div>
										<p className="text-gray-500">Requested Quantity:</p>
										<p className="font-medium">{deploymentRequest.requestedQuantity}</p>
									</div>
								</div>
							</div>

							{/* User Allocation */}
							<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
								<h4 className="text-lg font-semibold text-gray-900 mb-4">Assign Personnel</h4>

								{usersLoading && <LoadingPanel text="Loading available users..." />}

								{usersErrorMessage && !usersLoading && (
									<ErrorRetryBlock
										message="Unable to load available users."
										onRetry={() => fetchUsers()}
									/>
								)}

								{!usersLoading && !usersErrorMessage && (
									<>
										{availableUsers.length === 0 ? (
											<p className="text-gray-500 italic">No available personnel found.</p>
										) : (
											<div className="space-y-3">
												{availableUsers.map((user: User) => (
													<div
														key={user.userId}
														className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
													>
														<div className="flex items-center space-x-3">
															<input
																type="checkbox"
																id={`user-${user.userId}`}
																checked={allocation.selectedUsers.includes(user.userId)}
																onChange={() => handleUserToggle(user.userId)}
																className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
															/>
															<div>
																<p className="font-medium text-gray-900">
																	{user.firstName} {user.lastName}
																</p>
																{user.responderProfile?.primarySpecialization && (
																	<p className="text-sm text-gray-500">
																		{user.responderProfile.primarySpecialization}
																	</p>
																)}
															</div>
														</div>
														<div className="text-sm text-gray-600">{user.email}</div>
													</div>
												))}
											</div>
										)}
									</>
								)}
							</div>

							{/* Resource Allocation */}
							<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
								<h4 className="text-lg font-semibold text-gray-900 mb-4">Assign Resources</h4>

								{resourcesLoading && <LoadingPanel text="Loading available resources..." />}

								{resourcesErrorMessage && !resourcesLoading && (
									<ErrorRetryBlock
										message="Unable to load available resources."
										onRetry={() => fetchResources()}
									/>
								)}

								{!resourcesLoading && !resourcesErrorMessage && (
									<>
										{availableResources.length === 0 ? (
											<p className="text-gray-500 italic">No available resources found.</p>
										) : (
											<div className="space-y-3">
												{availableResources.map((resource: Resource) => {
													const currentSelection = allocation.selectedResources.find(
														r => r.resourceId === resource.resourceId
													);
													const selectedQuantity = currentSelection?.quantity || 0;

													return (
														<div
															key={resource.resourceId}
															className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
														>
															<div className="flex-1">
																<p className="font-medium text-gray-900">{resource.name}</p>
																<p className="text-sm text-gray-500">
																	Type: {resource.resourceType} • Available:{' '}
																	{resource.availableQuantity ?? 0}
																</p>
															</div>
															<div className="flex items-center space-x-3">
																<label
																	htmlFor={`resource-${resource.resourceId}`}
																	className="text-sm text-gray-600"
																>
																	Quantity:
																</label>
																<input
																	type="number"
																	id={`resource-${resource.resourceId}`}
																	min="0"
																	max={resource.availableQuantity ?? 1}
																	value={selectedQuantity}
																	onChange={e =>
																		handleResourceQuantityChange(
																			resource.resourceId,
																			parseInt(e.target.value) || 0
																		)
																	}
																	className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
																/>
															</div>
														</div>
													);
												})}
											</div>
										)}
									</>
								)}
							</div>

							{/* Submit Section */}
							<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
								<div className="flex justify-between items-center">
									<div>
										<h4 className="text-lg font-semibold text-gray-900 mb-2">Allocation Summary</h4>
										<p className="text-sm text-gray-600">
											Personnel: {allocation.selectedUsers.length} selected • Resources:{' '}
											{allocation.selectedResources.length} selected
										</p>
									</div>
									<div className="flex space-x-4">
										<Button
											variant="outline"
											onClick={() => navigate(`/deployment-requests/${id}`)}
										>
											Cancel
										</Button>
										<Button
											variant="primary"
											onClick={handleSubmitAllocation}
											disabled={!isValidAllocation || isSubmitting}
										>
											{isSubmitting ? 'Submitting...' : 'Submit Allocation'}
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</AuthGuard>
	);
}
