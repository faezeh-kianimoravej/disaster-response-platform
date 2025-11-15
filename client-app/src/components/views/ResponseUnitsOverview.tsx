import { useEffect } from 'react';
import type { FC } from 'react';
import { useResponseUnits } from '@/hooks/useResponseUnit';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';

const ResponseUnitsOverview: FC<{ departmentId: number }> = ({ departmentId }) => {
	const {
		data: units = [],
		isLoading,
		error,
		refetch,
	} = useResponseUnits(departmentId, { enabled: !!departmentId });

	const showSingleError = useSingleErrorToast();

	useEffect(() => {
		showSingleError({
			key: `responseUnits.${departmentId}`,
			error,
			loading: isLoading,
			message: 'Unable to load response units.',
		});
	}, [error, isLoading, departmentId, showSingleError]);

	if (isLoading) return <LoadingPanel text="Loading response units..." />;

	if (error)
		return (
			<div className="mb-6">
				<ErrorRetryBlock message="Unable to load response units." onRetry={() => refetch()} />
			</div>
		);

	if (units.length === 0)
		return <p className="text-center text-gray-600">No response units found.</p>;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{units.map(u => (
				<div key={u.unitId} className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-1 normal-case">{u.unitName}</h3>
					<p className="text-sm text-gray-500 mb-2 normal-case">{u.unitType}</p>
					<p className="text-gray-700 normal-case">
						<strong>Status:</strong> {u.status}
					</p>
					<p className="text-gray-700 normal-case">
						<strong>Personnel (default):</strong> {u.defaultPersonnel?.length ?? 0}
					</p>
					<p className="text-gray-700 normal-case">
						<strong>Resources (default):</strong> {u.defaultResources?.length ?? 0}
					</p>
					<p className="text-gray-700 normal-case">
						<strong>Current personnel:</strong> {u.currentPersonnel?.length ?? 0}
					</p>
				</div>
			))}
		</div>
	);
};

export default ResponseUnitsOverview;
