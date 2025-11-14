interface Tab {
	label: string;
	key: string;
}

interface TabsProps {
	tabs: Tab[];
	activeKey: string;
	onChange: (key: string) => void;
	className?: string;
}

export default function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
	return (
		<div className={`flex border-b mb-6 ${className ?? ''}`} role="tablist">
			{tabs.map(tab => (
				<button
					key={tab.key}
					role="tab"
					aria-selected={activeKey === tab.key}
					className={`px-4 py-2 -mb-px border-b-2 font-medium focus:outline-none transition-colors duration-150 ${
						activeKey === tab.key
							? 'border-blue-600 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-blue-600'
					}`}
					onClick={() => onChange(tab.key)}
					type="button"
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
