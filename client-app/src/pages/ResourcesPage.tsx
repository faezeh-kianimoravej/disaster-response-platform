export default function ResourcesPage() {
	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Resource Management</h1>
				<div className="bg-white rounded-lg shadow-md p-6">
					<p className="text-gray-600 mb-6">
						Track and allocate emergency resources efficiently across all response teams.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="bg-blue-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-blue-900 mb-2">Medical Supplies</h3>
							<p className="text-blue-700">Available: 85%</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-green-900 mb-2">Emergency Vehicles</h3>
							<p className="text-green-700">Available: 92%</p>
						</div>
						<div className="bg-orange-50 p-4 rounded-lg">
							<h3 className="text-lg font-semibold text-orange-900 mb-2">Personnel</h3>
							<p className="text-orange-700">On Duty: 78%</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
