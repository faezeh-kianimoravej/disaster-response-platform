import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDepartments } from '@/api/department';
import Button from '@/components/Button';
import type { Department } from '@/types/department';

interface DepartmentsPageProps {
	municipalityId: number;
}

export default function DepartmentsPage({ municipalityId }: DepartmentsPageProps) {
	const [departments, setDepartments] = useState<Department[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		async function loadDepartments() {
			const allDepartments = await getDepartments();

			const filtered = allDepartments.filter(
				(d: Department) => d.municipalityId === municipalityId
			);
			setDepartments(filtered);
		}

		loadDepartments();
	}, [municipalityId]);

	const handleAddNew = () => {
		navigate('/departments/new');
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Departments</h1>
					<Button onClick={handleAddNew} variant="primary">
						Add New Department
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{departments.length === 0 ? (
						<p className="text-gray-600">No departments found for this municipality.</p>
					) : (
						departments.map(d => (
							<Link
								key={d.departmentId}
								to={`/departments/${d.departmentId}`}
								className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
							>
								<img src={d.image} alt={d.name} className="h-24 w-24 object-contain mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-800 mb-2">{d.name}</h3>
							</Link>
						))
					)}
				</div>
			</div>
		</div>
	);
}
