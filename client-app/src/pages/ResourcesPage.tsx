import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { getResources } from '@/api/resource';
import Button from '@/components/Button';
import type { Resource } from '@/types/resource';

export default function ResourcesPage() {
	const [resources, setResources] = useState<Resource[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const { departmentId } = useParams<{ departmentId: string }>();
	const location = useLocation();

	const municipalityIdFromState = location.state?.municipalityId;
	const [municipalityId, setMunicipalityId] = useState<number | null>(
		municipalityIdFromState || Number(localStorage.getItem('municipalityId')) || null
	);

	useEffect(() => {
		if (municipalityIdFromState) {
			localStorage.setItem('municipalityId', String(municipalityIdFromState));
			setMunicipalityId(municipalityIdFromState);
		}
	}, [municipalityIdFromState]);

	useEffect(() => {
		async function fetchResources() {
			try {
				const data = await getResources();
				if (departmentId) {
					const filtered = data.filter((r: Resource) => r.departmentId === Number(departmentId));
					setResources(filtered);
				} else {
					setResources(data);
				}
			} catch (err) {
				console.error('Failed to load resources:', err);
			} finally {
				setLoading(false);
			}
		}

		fetchResources();

		const handleFocus = () => fetchResources();
		window.addEventListener('focus', handleFocus);
		return () => window.removeEventListener('focus', handleFocus);
	}, [departmentId]);

	const handleAddNew = () => {
		if (departmentId) {
			navigate(`/resources/${departmentId}/new`, { state: { municipalityId } });
		}
	};

	const handleBack = () => {
		if (municipalityId) {
			navigate(`/departments/${municipalityId}`);
		} else {
			navigate('/municipalities'); // fallback if state is lost
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
				<p className="text-gray-600">Loading resources...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
					<div className="flex space-x-3">
						<Button onClick={handleBack} variant="outline">
							Back
						</Button>
						<Button onClick={handleAddNew} variant="primary">
							Add New Resource
						</Button>
					</div>
				</div>

				{resources.length === 0 ? (
					<p className="text-center text-gray-600">No resources available.</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{resources.map(r => (
							<Link
								key={r.resourceId}
								to={`/resources/${departmentId}/${r.resourceId}`}
								state={{ municipalityId }}
								className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
							>
								<img src={r.image} alt={r.name} className="h-24 w-24 object-contain mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-800 mb-2">{r.name}</h3>
								<p className="text-sm text-gray-500 mb-2">{r.description}</p>
								<p className="text-gray-700">
									<strong>Quantity:</strong> {r.quantity}
								</p>
								<p className="text-gray-700">
									<strong>Available:</strong> {r.available}
								</p>
								<p className="text-gray-700">
									<strong>Type:</strong> {r.resourceType}
								</p>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
