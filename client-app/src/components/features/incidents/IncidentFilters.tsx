import type { IncidentSeverity, IncidentStatus } from '@/types/incident';
import FormInput from '@/components/forms/base/FormInput';

interface IncidentFiltersProps {
	statusFilter: string;
	priorityFilter: string;
	gripFilter: string;
	timeFilter: string;
	searchQuery: string;
	onStatusChange: (value: string) => void;
	onPriorityChange: (value: string) => void;
	onGripChange: (value: string) => void;
	onTimeChange: (value: string) => void;
	onSearchChange: (value: string) => void;
	onClearAll: () => void;
	hideClosedOption?: boolean;
}

export default function IncidentFilters({
	statusFilter,
	priorityFilter,
	gripFilter,
	timeFilter,
	searchQuery,
	onStatusChange,
	onPriorityChange,
	onGripChange,
	onTimeChange,
	onSearchChange,
	onClearAll,
	hideClosedOption = false,
}: IncidentFiltersProps) {
	const baseStatusOptions: IncidentStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
	const statusOptions: IncidentStatus[] = hideClosedOption
		? (baseStatusOptions.filter(s => s !== 'Closed') as IncidentStatus[])
		: baseStatusOptions;
	const priorityOptions: IncidentSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
	const gripOptions = [1, 2, 3, 4, 5];
	const timeOptions = [
		{ value: 'last15', label: 'Last 15 min' },
		{ value: 'last30', label: 'Last 30 min' },
		{ value: 'last1h', label: 'Last hour' },
		{ value: 'last3h', label: 'Last 3 hours' },
		{ value: 'last6h', label: 'Last 6 hours' },
		{ value: 'last24h', label: 'Last 24 hours' },
		{ value: 'today', label: 'Today' },
	];

	const hasActiveFilters =
		statusFilter || priorityFilter || gripFilter || timeFilter || searchQuery;

	return (
		<div className="mb-6">
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<FormInput
					label=""
					name="status"
					type="select"
					value={statusFilter}
					onChange={e => onStatusChange(e.target.value)}
					placeholder="Status"
					options={[
						{ value: '', label: 'Status' },
						...statusOptions.map(status => ({ value: status, label: status })),
					]}
					className="px-4 py-2 border-gray-300 rounded-lg"
					isActive={!!statusFilter}
				/>

				<FormInput
					label=""
					name="priority"
					type="select"
					value={priorityFilter}
					onChange={e => onPriorityChange(e.target.value)}
					placeholder="Priority"
					options={[
						{ value: '', label: 'Priority' },
						...priorityOptions.map(priority => ({ value: priority, label: priority })),
					]}
					className="px-4 py-2 border-gray-300 rounded-lg"
					isActive={!!priorityFilter}
				/>

				<FormInput
					label=""
					name="grip"
					type="select"
					value={gripFilter}
					onChange={e => onGripChange(e.target.value)}
					placeholder="GRIP"
					options={[
						{ value: '', label: 'GRIP' },
						...gripOptions.map(grip => ({ value: grip, label: `GRIP ${grip}` })),
					]}
					className="px-4 py-2 border-gray-300 rounded-lg"
					isActive={!!gripFilter}
				/>

				<FormInput
					label=""
					name="time"
					type="select"
					value={timeFilter}
					onChange={e => onTimeChange(e.target.value)}
					placeholder="Time"
					options={[{ value: '', label: 'Time' }, ...timeOptions]}
					className="px-4 py-2 border-gray-300 rounded-lg"
					isActive={!!timeFilter}
				/>

				<FormInput
					label=""
					name="search"
					type="text"
					value={searchQuery}
					onChange={e => onSearchChange(e.target.value)}
					placeholder="Search"
					className="px-4 py-2 border-gray-300 rounded-lg"
					isActive={!!searchQuery}
				/>
			</div>

			{hasActiveFilters && (
				<div className="mt-4 flex items-center gap-2">
					<span className="text-sm font-medium text-gray-700">Active filters:</span>
					<div className="flex flex-wrap gap-2 flex-1">
						{statusFilter && (
							<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
								Status: {statusFilter}
								<button
									onClick={() => onStatusChange('')}
									className="hover:bg-blue-200 rounded-full p-0.5"
									aria-label="Remove status filter"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							</span>
						)}
						{priorityFilter && (
							<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
								Priority: {priorityFilter}
								<button
									onClick={() => onPriorityChange('')}
									className="hover:bg-blue-200 rounded-full p-0.5"
									aria-label="Remove priority filter"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							</span>
						)}
						{gripFilter && (
							<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
								GRIP: {gripFilter}
								<button
									onClick={() => onGripChange('')}
									className="hover:bg-blue-200 rounded-full p-0.5"
									aria-label="Remove GRIP filter"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							</span>
						)}
						{timeFilter && (
							<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
								Time: {timeOptions.find(opt => opt.value === timeFilter)?.label || timeFilter}
								<button
									onClick={() => onTimeChange('')}
									className="hover:bg-blue-200 rounded-full p-0.5"
									aria-label="Remove time filter"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							</span>
						)}
						{searchQuery && (
							<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
								Search: &quot;{searchQuery}&quot;
								<button
									onClick={() => onSearchChange('')}
									className="hover:bg-blue-200 rounded-full p-0.5"
									aria-label="Remove search filter"
								>
									<svg
										className="w-4 h-4"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path d="M6 18L18 6M6 6l12 12"></path>
									</svg>
								</button>
							</span>
						)}
					</div>
					<button
						onClick={onClearAll}
						className="px-4 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
					>
						Clear All Filters
					</button>
				</div>
			)}
		</div>
	);
}
