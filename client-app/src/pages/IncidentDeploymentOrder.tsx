import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import { REGION_ROLES } from '@/types/role';
import {
	ResponseUnitType,
	RESPONSE_UNIT_TYPES,
	AvailableResponseUnitSearchResult,
} from '@/types/responseUnit';
import { useCurrentUserId } from '@/context/AuthContext';
import { useIncident } from '@/hooks/useIncident';
import { useAllDepartments } from '@/hooks/useDepartment';
import { useMunicipalities } from '@/hooks/useMunicipality';
import {
	useCreateDeploymentOrder,
	useDeploymentOrderByIncidentId,
} from '@/hooks/useDeploymentOrder';
import {
	useSearchAvailableResponseUnits,
	UseSearchAvailableResponseUnitsParams,
} from '@/hooks/useResponseUnit';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingPanel from '@/components/ui/LoadingPanel';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/toast/ToastProvider';
import { ErrorRetryInline } from '@/components/ui/ErrorRetry';
import RHFSelect from '@/components/forms/rhf/RHFSelect';
import FormShell from '@/components/forms/base/FormShell';
import { useForm } from 'react-hook-form';
import type { Department } from '@/types/department';
import type { Municipality } from '@/types/municipality';

export default function IncidentDeploymentOrder() {
	const { incidentId } = useParams<{ incidentId: string }>();
	const incidentIdNumber = incidentId ? Number(incidentId) : undefined;
	const navigate = useNavigate();
	const currentUserId = useCurrentUserId();
	const { showToast } = useToast();
	const showSingleError = useSingleErrorToast();

	const {
		incident,
		loading: incidentLoading,
		error: incidentError,
	} = useIncident(incidentIdNumber);
	const {
		departments,
		loading: departmentsLoading,
		error: departmentsError,
		refetch: refetchDepartments,
	} = useAllDepartments();
	const {
		municipalities,
		loading: municipalitiesLoading,
		error: municipalitiesError,
		refetch: refetchMunicipalities,
	} = useMunicipalities(incident?.regionId, { enabled: !!incident?.regionId });
	const createDeploymentOrderMutation = useCreateDeploymentOrder();
	const {
		data: deploymentOrders = [],
		isLoading: existingOrderLoading,
		error: existingOrderError,
		isError: hasExistingOrderError,
	} = useDeploymentOrderByIncidentId(incidentIdNumber);

	// Search filter form state
	const filterForm = useForm<{
		unitType: ResponseUnitType | '';
		departmentId: string;
		municipalityId: string;
	}>({
		defaultValues: { unitType: '', departmentId: '', municipalityId: '' },
	});
	const selectedUnitType = filterForm.watch('unitType');
	const selectedDepartment = filterForm.watch('departmentId');
	const selectedMunicipality = filterForm.watch('municipalityId');
	// Store selected units as a map: unitId -> unit
	const [selectedUnits, setSelectedUnits] = useState<
		Record<number, AvailableResponseUnitSearchResult>
	>({});

	const searchParams: UseSearchAvailableResponseUnitsParams = useMemo(() => {
		const params: UseSearchAvailableResponseUnitsParams = {
			incidentId: incidentIdNumber ?? 0,
			unitType: selectedUnitType as ResponseUnitType,
		};
		if (selectedDepartment) params.departmentId = Number(selectedDepartment);
		if (selectedMunicipality && selectedMunicipality !== '')
			params.municipalityId = Number(selectedMunicipality);
		return params;
	}, [incidentIdNumber, selectedUnitType, incident, selectedDepartment, selectedMunicipality]);
	const searchQuery = useSearchAvailableResponseUnits(searchParams);
	const searchResults = searchQuery.data ?? [];
	const searchLoading = searchQuery.isFetching || incidentLoading;

	useEffect(() => {
		if (incidentError) {
			showSingleError({
				key: `incident.details.${incidentIdNumber ?? 'unknown'}`,
				error: incidentError,
				loading: incidentLoading,
				message: 'Unable to load incident.',
			});
		} else if (departmentsError) {
			showSingleError({
				key: `departments.list`,
				error: departmentsError,
				loading: departmentsLoading,
				message: 'Unable to load departments.',
			});
		} else if (municipalitiesError) {
			showSingleError({
				key: `municipalities.list`,
				error: municipalitiesError,
				loading: municipalitiesLoading,
				message: 'Unable to load municipalities.',
			});
		} else if (existingOrderError && hasExistingOrderError) {
			showSingleError({
				key: `deployment-order.${incidentIdNumber ?? 'unknown'}`,
				error: existingOrderError,
				loading: existingOrderLoading,
				message: 'Unable to load existing deployment order.',
			});
		}
	}, [
		incidentError,
		departmentsError,
		municipalitiesError,
		incidentLoading,
		departmentsLoading,
		municipalitiesLoading,
		existingOrderError,
		existingOrderLoading,
		hasExistingOrderError,
		incidentIdNumber,
		showSingleError,
	]);

	// Handle unit selection (toggle or set quantity)
	const handleSelectUnit = (unitId: number) => {
		const unit = searchResults.find(u => u.unitId === unitId);
		if (!unit) return;
		setSelectedUnits(prev => ({
			...prev,
			[unitId]: unit,
		}));
	};
	const handleDeselectUnit = (unitId: number) => {
		setSelectedUnits(prev => {
			const copy = { ...prev };
			delete copy[unitId];
			return copy;
		});
	};

	// Finalize deployment order
	const handleFinalize = async () => {
		if (!incidentIdNumber || !currentUserId || !incident) {
			showToast('Invalid incident or user.', 'error');
			return;
		}
		const deploymentRequests: {
			targetDepartmentId: number;
			requestedUnitType: string;
			requestedQuantity: number;
		}[] = [];
		for (const unit of Object.values(selectedUnits)) {
			deploymentRequests.push({
				targetDepartmentId: unit.departmentId,
				requestedUnitType: unit.unitType,
				requestedQuantity: 1,
			});
		}
		try {
			await createDeploymentOrderMutation.mutateAsync({
				incidentId: incidentIdNumber,
				orderedBy: currentUserId!,
				incidentSeverity: incident.severity,
				deploymentRequests,
			});
			showToast('Deployment order created successfully.', 'success');
			navigate(routes.incident(incidentIdNumber ?? ''));
		} catch {
			showToast('Failed to create deployment order. Please try again.', 'error');
		}
	};

	if (incidentLoading)
		return <LoadingPanel className="min-h-screen" text="Loading incident details..." />;
	if (!incident)
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-700 mb-2">Incident not found</h2>
					<p className="text-gray-500">The requested incident could not be found.</p>
				</div>
			</div>
		);

	return (
		<AuthGuard requireRoles={[...REGION_ROLES]} requireAccessToRegion={incident.regionId}>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-5xl mx-auto px-4">
					<h1 className="text-2xl font-bold mb-4">Deployment Order for {incident.title}</h1>

					<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
						<div className="flex items-center gap-4 mb-2">
							<Badge variant="info">{incident.status}</Badge>
							<Badge variant="danger">Severity: {incident.severity}</Badge>
						</div>
						<div className="text-sm text-gray-700 mb-2">
							{incident.description ? (
								<div className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">
									{incident.description}
								</div>
							) : (
								<span className="text-gray-500">No description provided.</span>
							)}
						</div>
					</div>

					{/* Existing deployment orders (if any) */}
					<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
						{existingOrderLoading ? (
							<LoadingPanel text="Loading existing deployment orders..." className="py-4" />
						) : hasExistingOrderError ? (
							<ErrorRetryInline
								message="Failed to load deployment orders"
								onRetry={() => window.location.reload()}
							/>
						) : deploymentOrders.length > 0 ? (
							<>
								<h3 className="text-lg font-semibold mb-4">Existing Deployment Orders</h3>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead>
											<tr>
												<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
													Ordered At
												</th>
												<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
													Requested Units
												</th>
											</tr>
										</thead>
										<tbody>
											{deploymentOrders.map(order => (
												<tr key={order.deploymentOrderId} className="hover:bg-gray-50">
													<td className="px-4 py-2">{order.orderedAt.toLocaleString()}</td>
													<td className="px-4 py-2">
														{order.deploymentRequests.length > 0 ? (
															<div className="space-y-1">
																{order.deploymentRequests.map((req, idx) => (
																	<div key={idx} className="text-sm">
																		<span className="font-medium">{req.requestedUnitType}</span>
																		<span className="text-gray-600">
																			{' '}
																			× {req.requestedQuantity}
																		</span>
																	</div>
																))}
															</div>
														) : (
															<span className="text-gray-500">No requests</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</>
						) : (
							<div className="text-gray-500 text-center py-4">
								<div className="text-lg mb-2">No existing deployment orders for this incident.</div>
								<div className="text-sm">You can create a new deployment order below.</div>
							</div>
						)}
					</div>

					{/* Search and select response units */}
					<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
						<h3 className="text-lg font-semibold mb-4">Search Available Response Units</h3>
						<FormShell methods={filterForm} onSubmit={() => {}} footer={false} className="p-0 m-0">
							<div className="flex flex-wrap gap-6 mb-4">
								<div className="min-w-[220px] flex-1">
									<RHFSelect
										name="unitType"
										label="Unit Type"
										options={RESPONSE_UNIT_TYPES.map((type: ResponseUnitType) => ({
											value: type,
											label: type,
										}))}
										required
									/>
								</div>
								<div className="min-w-[220px] flex-1">
									<RHFSelect
										name="departmentId"
										label="Department"
										options={[
											{ value: '', label: 'All' },
											...departments.map((dept: Department) => ({
												value: String(dept.departmentId),
												label: dept.name,
											})),
										]}
										disabled={departmentsLoading || !!departmentsError}
									/>
									{departmentsLoading && (
										<LoadingPanel text="Loading departments..." className="py-4" />
									)}
									{departmentsError && (
										<ErrorRetryInline
											message={departmentsError || 'Failed to load departments.'}
											onRetry={refetchDepartments}
											className="py-2"
										/>
									)}
								</div>
								<div className="min-w-[220px] flex-1">
									<RHFSelect
										name="municipalityId"
										label="Municipality"
										options={[
											{ value: '', label: 'All' },
											...municipalities.map((muni: Municipality) => ({
												value: String(muni.municipalityId),
												label: muni.name,
											})),
										]}
										disabled={municipalitiesLoading || !!municipalitiesError}
									/>
									{municipalitiesLoading && (
										<LoadingPanel text="Loading municipalities..." className="py-4" />
									)}
									{municipalitiesError && (
										<ErrorRetryInline
											message={municipalitiesError || 'Failed to load municipalities.'}
											onRetry={refetchMunicipalities}
											className="py-2"
										/>
									)}
								</div>
							</div>
						</FormShell>
						{searchLoading ? (
							<LoadingPanel text="Searching response units..." className="py-8" />
						) : (
							<div>
								{searchResults.length === 0 ? (
									<div className="text-gray-500">
										No available response units found for this incident.
									</div>
								) : (
									<table className="min-w-full divide-y divide-gray-200">
										<thead>
											<tr>
												<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
													Unit Name
												</th>
												<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
													Type
												</th>
												<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
													Department
												</th>
												<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
													Distance (km)
												</th>
												<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
													Select
												</th>
											</tr>
										</thead>
										<tbody>
											{searchResults.map(unit => (
												<tr key={unit.unitId} className="hover:bg-gray-50">
													<td className="px-4 py-2">{unit.unitName}</td>
													<td className="px-4 py-2">{unit.unitType}</td>
													<td className="px-4 py-2">{unit.departmentName}</td>
													<td className="px-4 py-2">
														{typeof unit.distanceKm === 'number' ? unit.distanceKm.toFixed(1) : '-'}
													</td>
													<td className="px-4 py-2">
														{selectedUnits[unit.unitId] ? (
															<Button
																type="button"
																variant="danger"
																onClick={() => handleDeselectUnit(unit.unitId)}
																className="px-2 py-1 text-xs"
															>
																Remove
															</Button>
														) : (
															<Button
																type="button"
																variant="success"
																onClick={() => handleSelectUnit(unit.unitId)}
																className="px-2 py-1 text-xs"
															>
																Add
															</Button>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						)}
					</div>

					{/* Summary and finalize */}
					<form
						onSubmit={e => {
							e.preventDefault();
							handleFinalize();
						}}
						className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
					>
						<h3 className="text-lg font-semibold mb-4">Selected Response Units</h3>
						{Object.keys(selectedUnits).length === 0 ? (
							<div className="text-gray-500 mb-4">No units selected.</div>
						) : (
							<div className="mb-4">
								{Object.entries(
									Object.groupBy(Object.values(selectedUnits), unit => unit.departmentName)
								).map(([departmentName, units]) => (
									<div key={departmentName} className="mb-2">
										<div className="font-semibold text-gray-700 mb-1">{departmentName}</div>
										<ul className="ml-4 list-disc">
											{(units ?? []).map(unit => (
												<li key={unit.unitId}>
													<span className="font-medium">{unit.unitName}</span> ({unit.unitType})
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						)}
						<div className="mt-6 flex justify-end space-x-4">
							<Button
								type="submit"
								variant={createDeploymentOrderMutation.isPending ? 'disabled' : 'success'}
								className="px-6 py-2"
								disabled={createDeploymentOrderMutation.isPending}
							>
								{createDeploymentOrderMutation.isPending ? (
									<>
										<span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
										Processing...
									</>
								) : (
									'Finalize Deployment Order'
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate(routes.incident(incidentIdNumber ?? ''))}
								disabled={createDeploymentOrderMutation.isPending}
							>
								Cancel
							</Button>
						</div>
					</form>
				</div>
			</div>
		</AuthGuard>
	);
}
