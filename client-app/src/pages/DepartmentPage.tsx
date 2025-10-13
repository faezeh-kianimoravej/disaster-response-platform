import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDepartment } from '@/hooks/useDepartment';
import DepartmentForm from '@/components/forms/DepartmentForm';
import DepartmentView from '@/components/views/DepartmentView';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/toast/ToastProvider';
import type { DepartmentFormData } from '@/types/department';

export default function DepartmentPage() {
	const { departmentId, municipalityId } = useParams<{
		departmentId?: string;
		municipalityId?: string;
	}>();
	const isNewDepartment = departmentId === 'new';
	const navigate = useNavigate();
	const { showSuccess, showError } = useToast();

	const { department, loading, saveDepartment, removeDepartment } = useDepartment(
		departmentId,
		isNewDepartment,
		municipalityId ? Number(municipalityId) : 0
	);

	const [editing, setEditing] = useState(isNewDepartment);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Handle navigation for invalid IDs
	useEffect(() => {
		if (!isNewDepartment && departmentId && isNaN(Number(departmentId))) {
			navigate(`/departments/${municipalityId}`);
		}
	}, [departmentId, navigate, isNewDepartment]);

	// Auto-disable editing for existing departments
	useEffect(() => {
		if (!isNewDepartment && department) {
			setEditing(false);
		}
	}, [department, isNewDepartment]);

	// Save handler
	const handleSave = async (formData: DepartmentFormData) => {
		try {
			const savedDept = await saveDepartment(formData);
			if (savedDept) {
				if (isNewDepartment) {
					showSuccess(`Department "${savedDept.name}" created successfully!`);
					navigate(`/departments/${municipalityId}`);
				} else {
					showSuccess(`Department "${savedDept.name}" updated successfully!`);
					setEditing(false);
				}
			} else {
				showError('Failed to save department. Please try again.');
			}
		} catch (err) {
			showError('An unexpected error occurred while saving.');
			console.error(err);
		}
	};

	// Delete handlers
	const handleDelete = () => {
		if (!department) return;
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!department) return;
		try {
			await removeDepartment();
			showSuccess(`Department "${department.name}" deleted successfully.`);
			navigate(`/departments/${municipalityId}`);
		} catch (err) {
			showError('An unexpected error occurred while deleting.');
			console.error(err);
		}
		setShowDeleteModal(false);
	};

	const handleCancel = () => {
		if (isNewDepartment) {
			navigate(`/departments/${municipalityId}`);
		} else {
			setEditing(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
				<p className="text-gray-600">Loading...</p>
			</div>
		);
	}

	if (!department && !isNewDepartment) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<h2 className="text-2xl font-semibold">Department not found</h2>
					<p className="mt-4 text-gray-600">The requested department was not found.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					{editing || isNewDepartment ? (
						<DepartmentForm
							{...(department && { initialData: department })}
							isNewDepartment={isNewDepartment}
							onSave={handleSave}
							onCancel={handleCancel}
							municipalityId={Number(municipalityId)}
						/>
					) : (
						<DepartmentView
							department={department!}
							onEdit={() => setEditing(true)}
							onDelete={handleDelete}
							onBack={() => navigate(`/departments/${municipalityId}`)}
						/>
					)}
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				title="Delete Department"
				message={`Are you sure you want to delete "${department?.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				onConfirm={confirmDelete}
				onCancel={() => setShowDeleteModal(false)}
			/>
		</div>
	);
}
