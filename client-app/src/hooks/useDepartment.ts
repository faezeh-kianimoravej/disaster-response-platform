// Moved from Department/useDepartment.ts
import { useState, useEffect } from 'react';
import {
	getDepartmentById,
	addDepartment,
	updateDepartment,
	deleteDepartment,
} from '@/api/department';
import type { Department, DepartmentFormData } from '@/types/department';

export function useDepartment(
	departmentId: string | undefined,
	isNewDepartment: boolean,
	municipalityId: number
) {
	const [department, setDepartment] = useState<Department | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isNewDepartment) {
			setLoading(false);
			return;
		}

		const id = departmentId ? Number(departmentId) : NaN;
		if (isNaN(id)) {
			setLoading(false);
			return;
		}

		const fetchDepartment = async () => {
			try {
				const d = await getDepartmentById(id);
				if (d && d.municipalityId === municipalityId) {
					setDepartment(d);
				} else {
					setDepartment(null);
				}
			} catch (err) {
				console.error('Failed to fetch department:', err);
				setDepartment(null);
			} finally {
				setLoading(false);
			}
		};

		fetchDepartment();
	}, [departmentId, isNewDepartment, municipalityId]);

	const saveDepartment = async (formData: DepartmentFormData): Promise<Department | null> => {
		if (isNewDepartment) {
			const newDepartment = await addDepartment(formData);
			setDepartment(newDepartment);
			return newDepartment;
		} else if (department) {
			const updated: Department = {
				...department,
				...formData,
			};
			const saved = await updateDepartment(updated);
			setDepartment(saved);
			return saved;
		}
		return null;
	};

	const removeDepartment = async (): Promise<void> => {
		if (department) {
			await deleteDepartment(department.departmentId);
			setDepartment(null);
		}
	};

	return { department, loading, saveDepartment, removeDepartment };
}
