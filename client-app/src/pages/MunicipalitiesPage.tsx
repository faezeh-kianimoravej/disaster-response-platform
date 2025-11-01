import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import type { Municipality } from '@/types/municipality';
import { useAuth } from '@/context/AuthContext';
import { useMunicipalities } from '@/hooks/useMunicipality';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import AuthGuard from '@/components/auth/AuthGuard';
import { REGION_ROLES } from '@/types/role';

export default function MunicipalitiesPage() {
	return (
		<AuthGuard requireRoles={[...REGION_ROLES]}>
			<MunicipalitiesPageContent />
		</AuthGuard>
	);
}

function MunicipalitiesPageContent() {
	const auth = useAuth();
	const navigate = useNavigate();
	const regionId = auth?.user?.regionId;
	const { municipalities, loading, error, refetch } = useMunicipalities(regionId, {
		enabled: !!regionId,
	});
	const showSingleError = useSingleErrorToast();

	useEffect(() => {
		showSingleError({
			key: `municipalities.${regionId ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load municipalities.',
		});
	}, [error, loading, regionId, showSingleError]);

	const handleMunicipalityClick = (municipalityId: number) => {
		navigate(routes.departments(municipalityId));
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Municipalities</h1>
				</div>

				<section aria-busy={loading} aria-live="polite">
					{loading && <LoadingPanel text="Loading municipalities..." />}

					{error && !loading && (
						<div className="mb-6">
							<ErrorRetryBlock
								message="Unable to load municipalities."
								onRetry={() => refetch()}
								className="p-0"
							/>
						</div>
					)}

					{!loading && !error && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{municipalities.length === 0 ? (
								<p className="text-gray-600">No municipalities found.</p>
							) : (
								municipalities.map((m: Municipality) => (
									<div
										key={m.municipalityId}
										className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
										onClick={() => handleMunicipalityClick(m.municipalityId)}
									>
										<img
											src={
												m.image
													? m.image.startsWith('data:')
														? m.image
														: `data:image/png;base64,${m.image}`
													: '/images/default.png'
											}
											alt={m.name}
											className="h-24 w-24 object-contain mx-auto mb-4"
										/>
										<h3 className="text-lg font-semibold text-gray-800 mb-2">{m.name}</h3>
									</div>
								))
							)}
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
