import { useState, useEffect } from 'react';
import type { Department } from '@/types/department';
import type { Municipality } from '@/types/municipality';
import type { Incident } from '@/types/incident';
import type { Resource } from '@/types/resource';
import { REGION_ROLES } from '@/types/role';

import { getDepartmentsByMunicipalityId } from '@/api/department';
import { getMunicipalitiesByRegionId } from '@/api/municipality';
import { RESOURCE_TYPES } from '@/utils/resourceUtils';
import ResourceSearchForm from '@/components/views/ResourceSearchForm';
import ResourceTable from '@/components/views/ResourceTable';
import AllocationSummary from '@/components/views/AllocationSummary';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/context/AuthContext';

import { useParams, useNavigate } from 'react-router-dom';
import { getIncidentById } from '@/api/incident';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/toast/ToastProvider';

// React Query hooks
import { useAllocatedResources, useAllocateResources } from '@/hooks/useIncident';
import { useSearchResources } from '@/hooks/useResource';
import { useAllDepartments } from '@/hooks/useDepartment';

const IncidentAllocateResourcePage = () => {
	const { incidentId } = useParams<{ incidentId: string }>();
	const navigate = useNavigate();
	const auth = useAuth();
	const { showToast } = useToast();

	const incidentIdNumber = incidentId ? Number(incidentId) : undefined;

	const [incident, setIncident] = useState<Incident | null>(null);
	const [resourceTypes, setResourceTypes] = useState<string[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
	const [selectedType, setSelectedType] = useState('');
	const [selectedDepartment, setSelectedDepartment] = useState('');
	const [selectedMunicipality, setSelectedMunicipality] = useState('');
	const [allocationQuantities, setAllocationQuantities] = useState<Record<string, number>>({});
	const [incidentLoading, setIncidentLoading] = useState(true);

	const [resourceMeta, setResourceMeta] = useState<{
		names: Record<string, string>;
		types: Record<string, string>;
	}>({ names: {}, types: {} });

	const { data: allocatedResources = [], isLoading: allocatedResourcesLoading } =
		useAllocatedResources(incidentIdNumber!);
	const { departments: allDepartments = [] } = useAllDepartments();
	const allocateResourcesMutation = useAllocateResources();

	const hasExistingAllocations = allocatedResources.length > 0;
	const loading = incidentLoading || allocatedResourcesLoading;

	const searchQuery = useSearchResources(
		incidentIdNumber,
		selectedType,
		selectedDepartment,
		selectedMunicipality,
		{ enabled: false }
	);

	useEffect(() => {
		if (!selectedType && !selectedDepartment && !selectedMunicipality) {
			searchQuery.refetch();
		}
	}, []);

	const searchResults = searchQuery.data ?? [];
	const searchResourcesLoading = searchQuery.isFetching;

	useEffect(() => {
		if (searchResults?.length) {
			setResourceMeta(prev => ({
				names: {
					...prev.names,
					...Object.fromEntries(searchResults.map(r => [r.resourceId, r.name])),
				},
				types: {
					...prev.types,
					...Object.fromEntries(searchResults.map(r => [r.resourceId, r.resourceType])),
				},
			}));
		}
	}, [searchResults]);

	// handle search click
	const handleSearch = () => {
		searchQuery.refetch();
	};

	// load resource types and municipalities
	useEffect(() => {
		const loadData = async () => {
			setResourceTypes(Object.values(RESOURCE_TYPES));
			const regionId = (auth?.user?.roles ?? [])
				.map(r => r.regionId)
				.find((id): id is number => typeof id === 'number');
			const munis = await getMunicipalitiesByRegionId(regionId ?? 1);
			setMunicipalities(munis);
		};
		loadData();
	}, [auth]);

	// load departments when municipality changes
	useEffect(() => {
		const loadDepartments = async () => {
			let depts;
			if (selectedMunicipality && selectedMunicipality !== 'All') {
				depts = await getDepartmentsByMunicipalityId(Number(selectedMunicipality));
			} else {
				depts = allDepartments;
			}
			setDepartments(depts);
		};
		loadDepartments();
	}, [selectedMunicipality, allDepartments]);

	// load incident details
	useEffect(() => {
		if (!incidentId) return;
		const id = Number(incidentId);
		const load = async () => {
			setIncidentLoading(true);
			try {
				const data = await getIncidentById(id);
				if (data) setIncident(data);
			} finally {
				setIncidentLoading(false);
			}
		};
		load();
	}, [incidentId]);

	// initialize allocation quantities
	useEffect(() => {
		if (allocatedResources.length > 0) {
			const quantities: Record<string, number> = {};
			allocatedResources.forEach((resource: Resource) => {
				quantities[resource.resourceId.toString()] = resource.quantity || 1;
			});
			setAllocationQuantities(quantities);
		}
	}, [allocatedResources]);

	const validateAllocations = () => {
		const entries = Object.entries(allocationQuantities);
		const validEntries = entries.filter(([, qty]) => qty && qty > 0);

		// Check if we have any allocations
		if (validEntries.length === 0) {
			const message = hasExistingAllocations
				? 'Please maintain at least one resource allocation.'
				: 'Please allocate at least one resource before finalizing.';
			showToast(message, 'error');
			return false;
		}

		// Check if all quantities are valid numbers
		const invalidEntries = entries.filter(
			([, qty]) => qty && (isNaN(qty) || qty < 1 || !Number.isInteger(qty))
		);

		if (invalidEntries.length > 0) {
			showToast('Please enter valid quantities for all resources.', 'error');
			return false;
		}

		return true;
	};

	const handleFinalize = async () => {
		if (!incidentIdNumber) return;

		if (!validateAllocations()) return;

		const entries = Object.entries(allocationQuantities).filter(([, qty]) => qty && qty > 0);

		const payload = entries.map(([resourceId, qty]) => ({
			resourceId: Number(resourceId),
			quantity: qty,
		}));

		try {
			await allocateResourcesMutation.mutateAsync({
				incidentId: incidentIdNumber,
				allocations: payload,
			});

			const message = hasExistingAllocations
				? 'Successfully updated resource allocations.'
				: 'Successfully allocated resources.';

			showToast(message, 'success');
			navigate(`/incidents/${incidentIdNumber}`);
		} catch {
			const message = hasExistingAllocations
				? 'Failed to update resource allocations. Please try again.'
				: 'Failed to allocate resources. Please try again.';
			showToast(message, 'error');
		}
	};

	if (loading) return <div className="p-6">Loading...</div>;
	if (!incident) return <div className="p-6">Incident not found</div>;

	return (
		<AuthGuard requireRoles={[...REGION_ROLES]} requireAccessToRegion={incident?.regionId}>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-5xl mx-auto px-4">
					<h1 className="text-2xl font-bold mb-4">
						{hasExistingAllocations ? 'Manage Resource Allocation' : 'Allocate Resources'}
					</h1>

					{/* Incident info */}
					<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
						<div className="flex gap-3 items-center mb-3">
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

					<form
						onSubmit={e => {
							e.preventDefault();
							handleFinalize();
						}}
						className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
					>
						{hasExistingAllocations ? (
							<>
								<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<h3 className="text-lg font-semibold text-blue-900 mb-2">
										Existing Resource Allocations
									</h3>
									<p className="text-blue-700">
										This incident already has allocated resources. Review the allocation summary
										below.
									</p>
								</div>
								<div className="flex flex-col md:flex-row gap-6 items-start w-full">
									<div className="w-full md:w-72">
										<AllocationSummary
											allocationQuantities={allocationQuantities}
											resourceTypesMap={Object.fromEntries(
												allocatedResources.map(r => [r.resourceId.toString(), r.resourceType])
											)}
											resourceNamesMap={Object.fromEntries(
												allocatedResources.map(r => [r.resourceId.toString(), r.name])
											)}
											editable={false}
										/>
									</div>
								</div>
							</>
						) : (
							<>
								<ResourceSearchForm
									resourceTypes={resourceTypes}
									departments={departments}
									municipalities={municipalities}
									selectedType={selectedType}
									setSelectedType={setSelectedType}
									selectedDepartment={selectedDepartment}
									setSelectedDepartment={setSelectedDepartment}
									selectedMunicipality={selectedMunicipality}
									setSelectedMunicipality={setSelectedMunicipality}
									onSearch={handleSearch}
								/>

								<div className="flex flex-col md:flex-row gap-6 items-start w-full">
									<div className="flex-1">
										{searchResourcesLoading ? (
											<p>Loading...</p>
										) : (
											<ResourceTable
												results={searchResults}
												allocationQuantities={allocationQuantities}
												setAllocationQuantities={setAllocationQuantities}
											/>
										)}
									</div>
									<div className="w-full md:w-72">
										<AllocationSummary
											allocationQuantities={allocationQuantities}
											resourceTypesMap={resourceMeta.types}
											resourceNamesMap={resourceMeta.names}
											editable={false}
											onChange={updatedQuantities => setAllocationQuantities(updatedQuantities)}
										/>
									</div>
								</div>
							</>
						)}

						<div className="mt-6 flex justify-end space-x-4">
							<Button
								type="submit"
								variant={allocateResourcesMutation.isPending ? 'disabled' : 'success'}
								className="px-4"
								disabled={allocateResourcesMutation.isPending}
							>
								{allocateResourcesMutation.isPending ? 'Processing...' : 'Finalize Allocation'}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate(`/incidents/${incidentIdNumber}`)}
							>
								Cancel
							</Button>
						</div>
					</form>
				</div>
			</div>
		</AuthGuard>
	);
};

export default IncidentAllocateResourcePage;
