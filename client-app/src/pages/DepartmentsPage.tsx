import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDepartmentsByMunicipalityId } from '@/api/department';
import Button from '@/components/Button';
import { Edit } from 'lucide-react';
import type { Department } from '@/types/department';

export default function DepartmentsPage() {
	const [departments, setDepartments] = useState<Department[]>([]);
	const navigate = useNavigate();
	const { municipalityId } = useParams<{ municipalityId: string }>();

	useEffect(() => {
		async function loadDepartments() {
			if (municipalityId) {
				const allDepartments = await getDepartmentsByMunicipalityId(Number(municipalityId));
				setDepartments(allDepartments);
			}
		}

		loadDepartments();
	}, [municipalityId]);

	// const handleAddNew = () => {
	// 	if (municipalityId) {
	// 		navigate(`/departments/${municipalityId}/new`);
	// 	}
	// };

	const handleDepartmentClick = (departmentId: number) => {
		navigate(`/resources/${departmentId}`, { state: { municipalityId } });
	};

	const handleEditClick = (e: React.MouseEvent, departmentId: number) => {
		e.stopPropagation();
		navigate(`/departments/${municipalityId}/${departmentId}`);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Departments</h1>
					<div className="flex space-x-3">
						<Button onClick={() => navigate('/municipalities')} variant="secondary">
							Back
						</Button>
						{/* <Button onClick={handleAddNew} variant="primary">
							Add New Department
						</Button> */}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{departments.length === 0 ? (
						<p className="text-gray-600">No departments found for this municipality.</p>
					) : (
						departments.map(d => (
							<div
								key={d.departmentId}
								onClick={() => handleDepartmentClick(d.departmentId)}
								className="relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
							>
								<button
									onClick={e => handleEditClick(e, d.departmentId)}
									className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
								>
									<Edit size={20} />
								</button>

								<img
									src={d.image.startsWith('data:') ? d.image : `/images/${d.image}`}
									alt={d.name}
									className="h-24 w-24 object-contain mx-auto mb-4"
								/>
								<h3 className="text-lg font-semibold text-gray-800 text-center">{d.name}</h3>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
