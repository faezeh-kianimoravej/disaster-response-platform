import { useState, useEffect } from 'react';
import type { ResourceSearchResult } from '@/types/resource';
import type { Department } from '@/types/department';
import type { Municipality } from '@/types/municipality';
import { getDepartmentsByMunicipalityId } from '@/api/department';
import { getMunicipalitiesByRegionId } from '@/api/municipality';
import { RESOURCE_TYPES } from '@/utils/resourceUtils';
import ResourceSearchForm from '@/components/views/ResourceSearchForm';
import ResourceTable from '@/components/views/ResourceTable';
import AllocationSummary from '@/components/views/AllocationSummary';
import { searchResources } from '@/api/resource';
import AuthGuard from '@/components/auth/AuthGuard';
import { REGION_ROLES } from '@/types/role';

import { useParams, useNavigate } from 'react-router-dom';
import {
	allocateResourcesToIncident,
	getIncidentById,
	getAllocatedResources,
} from '@/api/incident';
import type { Incident } from '@/types/incident';
import { Resource } from '@/types/resource';
import Button from '@/components/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/toast/ToastProvider';

const IncidentAllocateResourcePage = () => {
	const { incidentId } = useParams<{ incidentId: string }>();
	const navigate = useNavigate();
	const [incident, setIncident] = useState<Incident | null>(null);
	const [resourceTypes, setResourceTypes] = useState<string[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
	const [selectedType, setSelectedType] = useState('');
	const [selectedDepartment, setSelectedDepartment] = useState('');
	const [selectedMunicipality, setSelectedMunicipality] = useState('');
	const [searchResults, setSearchResults] = useState<ResourceSearchResult[]>([]);
	const [loading, setLoading] = useState(true);
	const [allocationQuantities, setAllocationQuantities] = useState<Record<string, number>>({});
	const [submitting, setSubmitting] = useState(false);
	const [hasExistingAllocations, setHasExistingAllocations] = useState(false);
	const [allocatedResources, setAllocatedResources] = useState<Resource[]>([]);
	const { showToast } = useToast();

	useEffect(() => {
		const loadData = async () => {
			setResourceTypes(Object.values(RESOURCE_TYPES));
			const depts = await getDepartmentsByMunicipalityId(1);
			const munis = await getMunicipalitiesByRegionId(1);			
			setDepartments(depts);
			setMunicipalities(munis);
		};
		loadData();
	}, []);

	useEffect(() => {
		if (!incidentId) return;
		const id = Number(incidentId);
		const load = async () => {
			setLoading(true);
			try {
				// Load incident data
				const data = await getIncidentById(id);
				if (data) setIncident(data);

				// Load existing allocations
				const existingAllocations = await getAllocatedResources(id);
				if (existingAllocations && existingAllocations.length > 0) {
					setAllocatedResources(existingAllocations);
					setHasExistingAllocations(true);

					// Convert allocated resources to allocation quantities format
					const quantities: Record<string, number> = {};
					existingAllocations.forEach(resource => {
						quantities[resource.resourceId.toString()] = resource.quantity || 1;
					});
					setAllocationQuantities(quantities);
				} else {
					setHasExistingAllocations(false);
					setAllocatedResources([]);
				}
			} catch (error) {
				console.error('Error loading data:', error);
				setHasExistingAllocations(false);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [incidentId]);

	useEffect(() => {
		handleSearch();
	}, []);

	const handleSearch = async () => {
		setLoading(true);
		const results = await searchResources(selectedType, selectedDepartment, selectedMunicipality);
		setSearchResults(results);
		setLoading(false);
	};

	const handleFinalize = async () => {
		if (!incidentId) return;
		const id = Number(incidentId);
		const entries = Object.entries(allocationQuantities).filter(([, qty]) => qty && qty > 0);

		if (entries.length === 0) {
			const message = hasExistingAllocations
				? 'Please maintain at least one resource allocation.'
				: 'Please allocate at least one resource before finalizing.';
			showToast(message, 'error');
			return;
		}

		const payload = entries.map(([resourceId, qty]) => ({
			resourceId: Number(resourceId),
			quantity: qty,
		}));

		try {
			setSubmitting(true);
			const response = await allocateResourcesToIncident(id, payload);
			const message = hasExistingAllocations
				? `Successfully updated allocations for ${response.allocatedResources.length} resources.`
				: `Successfully allocated ${response.allocatedResources.length} resources.`;
			showToast(message, 'success');
			navigate(`/incidents/${id}`);
		} catch (error) {
			console.error('Allocation operation failed:', error);
			const message = hasExistingAllocations
				? 'Failed to update resource allocations. Please try again.'
				: 'Failed to allocate resources. Please try again.';
			showToast(message, 'error');
		} finally {
			setSubmitting(false);
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
					{!hasExistingAllocations && (
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
					)}

					{hasExistingAllocations && (
						<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
							<h3 className="text-lg font-semibold text-blue-800 mb-2">
								Existing Resource Allocations
							</h3>
							<p className="text-sm text-blue-700">
								This incident already has allocated resources. You can edit quantities or remove
								resources from the summary panel.
							</p>
						</div>
					)}

					{hasExistingAllocations ? (
						// Layout for existing allocations - left-aligned AllocationSummary with original width
						<div className="flex flex-col md:flex-row gap-6 items-start w-full">
							<div className="w-full md:w-72">
								<AllocationSummary
									allocationQuantities={allocationQuantities}
									resourceTypesMap={Object.fromEntries(
										allocatedResources.map(r => [r.resourceId.toString(), r.resourceType])
									)}
									editable={hasExistingAllocations}
									onChange={updatedQuantities => {
										setAllocationQuantities(updatedQuantities);
									}}
									onSave={updatedQuantities => {
										setAllocationQuantities(updatedQuantities);
										showToast('Allocation quantities updated.', 'success');
									}}
								/>
							</div>
							<div className="flex-1"></div>
						</div>
					) : (
						// Original layout for new allocations - side-by-side
						<div className="flex flex-col md:flex-row gap-6 items-start w-full">
							<div className="flex-1">
								{loading ? (
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
									resourceTypesMap={Object.fromEntries(
										searchResults.map(r => [r.resourceId, r.resourceType])
									)}
									editable={false}
									onChange={updatedQuantities => {
										setAllocationQuantities(updatedQuantities);
									}}
									onSave={updatedQuantities => {
										setAllocationQuantities(updatedQuantities);
										showToast('Allocation quantities updated.', 'success');
									}}
								/>
							</div>
						</div>
					)}
					<div className="mt-6 flex justify-end space-x-4">
						<Button
							type="submit"
							variant={submitting ? 'disabled' : 'success'}
							className="px-4"
							disabled={submitting}
						>
							{hasExistingAllocations ? 'Update Allocation' : 'Finalize Allocation'}
						</Button>
						<Button type="button" variant="outline" onClick={() => navigate(-1)}>
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
