import Logo from '@/components/Logo';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
			<div className="max-w-4xl mx-auto text-center px-4">
				<Logo withText className="mx-auto mb-6" />
				<h1 className="text-4xl font-bold text-gray-900 mb-4">
					Disaster Response Crisis Communication System
				</h1>
				<p className="text-xl text-gray-600 mb-8">
					Coordinating emergency response and communication during critical situations
				</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Alerts</h3>
						<p className="text-gray-600">Real-time emergency notifications and alerts</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Resource Management</h3>
						<p className="text-gray-600">Track and allocate emergency resources efficiently</p>
					</div>
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h3 className="text-lg font-semibold text-gray-900 mb-2">Communication Hub</h3>
						<p className="text-gray-600">Centralized communication for response teams</p>
					</div>
				</div>
			</div>
		</div>
	);
}
