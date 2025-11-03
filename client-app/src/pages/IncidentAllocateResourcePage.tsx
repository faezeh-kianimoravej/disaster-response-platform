import { useState, useEffect } from 'react';
import type { ResourceSearchResult } from '@/types/resource';
import type { Department } from '@/types/department';
import type { Municipality } from '@/types/municipality';
import { getDepartments } from '@/api/department';
import { getMunicipalities } from '@/api/municipality';
import { RESOURCE_TYPES } from '@/utils/resourceUtils';
import ResourceSearchForm from '@/components/ResourceSearchForm';
import ResourceTable from '@/components/ResourceTable';
import AllocationSummary from '@/components/AllocationSummary';
import { searchResources } from '@/api/resource';

import { useParams, useNavigate } from 'react-router-dom';
import { allocateResourcesToIncident, getIncidentById } from '@/api/incident';
import type { Incident } from '@/types/incident';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
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
	const { showToast } = useToast();

	useEffect(() => {
		const loadData = async () => {
			setResourceTypes(Object.values(RESOURCE_TYPES));
			const depts = await getDepartments();
			const munis = await getMunicipalities();
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
			const data = await getIncidentById(id);
			if (data) setIncident(data);
			setLoading(false);
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
			showToast('Please allocate at least one resource before finalizing.', 'error');
			return;
		}

		const payload = entries.map(([resourceId, qty]) => ({
			resourceId: Number(resourceId),
			quantity: qty,
		}));

		try {
			setSubmitting(true);
			const response = await allocateResourcesToIncident(id, payload);
			showToast(
				`Successfully allocated ${response.allocatedResources.length} resources.`,
				'success'
			);
			navigate(`/incidents/${id}`);
		} catch (error) {
			console.error('Allocation failed:', error);
			showToast('Failed to allocate resources. Please try again.', 'error');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="p-6">Loading...</div>;
	if (!incident) return <div className="p-6">Incident not found</div>;

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-5xl mx-auto px-4">
				<h1 className="text-2xl font-bold mb-4">Allocate Resources</h1>

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
							/>
						</div>
					</div>
					<div className="mt-6 flex justify-end space-x-4">
						<Button
							type="submit"
							variant={submitting ? 'disabled' : 'success'}
							className="px-4"
							disabled={submitting}
						>
							Finalize Allocation
						</Button>
						<Button type="button" variant="outline" onClick={() => navigate(-1)}>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default IncidentAllocateResourcePage;
