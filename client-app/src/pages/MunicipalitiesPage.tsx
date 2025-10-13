import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Municipality } from '@/types/municipality';
import { getMunicipalities } from '@/api/municipality';

export default function MunicipalitiesPage() {
	const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		async function loadMunicipalities() {
			const allMunicipalities = await getMunicipalities();
			setMunicipalities(allMunicipalities);
		}
		loadMunicipalities();
	}, []);

	const handleMunicipalityClick = (municipalityId: number) => {
		navigate(`/departments/${municipalityId}`);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Municipalities</h1>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{municipalities.length === 0 ? (
						<p className="text-gray-600">No municipalities found.</p>
					) : (
						municipalities.map(m => (
							<div
								key={m.MunicipalityId}
								className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
								onClick={() => handleMunicipalityClick(m.MunicipalityId)}
							>
								<img src={m.Image} alt={m.Name} className="h-24 w-24 object-contain mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-800 mb-2">{m.Name}</h3>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
