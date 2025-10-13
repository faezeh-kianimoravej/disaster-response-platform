import { useEffect, useState } from 'react';
import type { Municipality } from '@/types/municipality';
import { getMunicipalities } from '@/api/municipality';

export function useMunicipality() {
	const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getMunicipalities()
			.then(data => {
				setMunicipalities(data);
				setLoading(false);
			})
			.catch(err => {
				setError(err.message || 'Error fetching municipalities');
				setLoading(false);
			});
	}, []);

	return { municipalities, loading, error };
}
