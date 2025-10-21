import type { Department } from '@/types/department';
import Button from '@/components/Button';

interface DepartmentViewProps {
	department: Department;
	onEdit: () => void;
	onDelete: () => void;
	onBack: () => void;
}

export default function DepartmentView({
	department,
	onEdit,
	onDelete,
	onBack,
}: DepartmentViewProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-6">
				<img
					src={
						department.image
							? department.image.startsWith('data:')
								? department.image
								: `data:image/png;base64,${department.image}`
							: '/images/default.png'
					}
					alt={department.name}
					className="h-32 w-32 object-contain rounded border"
				/>
				<div>
					<h2 className="text-2xl font-semibold text-gray-900">{department.name}</h2>
				</div>
			</div>

			<div className="flex justify-end space-x-3">
				<Button variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button variant="primary" onClick={onEdit}>
					Edit
				</Button>
				<Button variant="danger" onClick={onDelete}>
					Delete
				</Button>
			</div>
		</div>
	);
}
