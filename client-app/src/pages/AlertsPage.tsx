export default function AlertsPage() {
	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Emergency Alerts</h1>
				<div className="bg-white rounded-lg shadow-md p-6">
					<p className="text-gray-600 mb-4">
						Real-time emergency notifications and alert management system.
					</p>
					<div className="space-y-4">
						<div className="border-l-4 border-red-500 bg-red-50 p-4">
							<div className="flex">
								<div className="ml-3">
									<h3 className="text-sm font-medium text-red-800">Critical Alert</h3>
									<div className="mt-2 text-sm text-red-700">
										<p>Severe weather warning in effect for the metro area.</p>
									</div>
								</div>
							</div>
						</div>
						<div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
							<div className="flex">
								<div className="ml-3">
									<h3 className="text-sm font-medium text-yellow-800">Warning</h3>
									<div className="mt-2 text-sm text-yellow-700">
										<p>Road closures due to flooding in downtown area.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
