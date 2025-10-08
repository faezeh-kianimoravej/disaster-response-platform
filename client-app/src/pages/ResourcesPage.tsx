import { Link } from 'react-router-dom';
import { getResources } from '@/data/resources';

export default function ResourcesPage() {
	const resources = getResources();

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Resource Management</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{resources.map(r => (
						<Link
							key={r.resourceId}
							to={`/resources/${r.resourceId}`}
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
			</div>
		</div>
	);
}
