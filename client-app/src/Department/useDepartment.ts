import { useState, useEffect } from "react";
import {
  getDepartmentById,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByMunicipality,
} from "./api";
import type { Department, DepartmentFormData } from "./types";

/**
 * Custom hook for managing department data (CRUD)
 */
export function useDepartment(
  departmentId: string | undefined,
  isNewDepartment: boolean,
  municipalityId: number
) {
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNewDepartment) {
      // Skip fetching when creating a new department
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
        // Fetch the department by ID
        const d = await getDepartmentById(id);

        // Ensure department belongs to the same municipality
        if (d && d.municipalityId === municipalityId) {
          setDepartment(d);
        } else {
          setDepartment(null);
        }
      } catch (err) {
        console.error("Failed to fetch department:", err);
        setDepartment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [departmentId, isNewDepartment, municipalityId]);

  /**
   * Add or update a department
   */
  const saveDepartment = async (
    formData: DepartmentFormData
  ): Promise<Department | null> => {
    try {
      if (isNewDepartment) {
        // Always include municipalityId for new departments
        const newDept = await addDepartment({
          ...formData,
          municipalityId,
        });
        setDepartment(newDept);
        return newDept;
      } else if (department) {
        const updatedDept: Department = {
          departmentId: department.departmentId,
          municipalityId,
          name: formData.name,
          image: formData.image,
        };

        const updated = await updateDepartment(updatedDept);
        setDepartment(updated);
        return updated;
      }
      return null;
    } catch (err) {
      console.error("Failed to save department:", err);
      return null;
    }
  };

  /**
   * Delete department
   */
  const removeDepartment = async (): Promise<boolean> => {
    if (!department) return false;
    try {
      await deleteDepartment(department.departmentId);
      setDepartment(null);
      return true;
    } catch (err) {
      console.error("Failed to delete department:", err);
      return false;
    }
  };

  return {
    department,
    loading,
    saveDepartment,
    removeDepartment,
  };
}
