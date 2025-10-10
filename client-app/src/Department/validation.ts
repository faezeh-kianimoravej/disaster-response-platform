import type { ValidationResult } from "@/utils/validation";
import { validateRequired } from "@/utils/validation";
import type { DepartmentFormData } from "./types";

// Fields that need validation
type DepartmentValidationFields = Pick<DepartmentFormData, "name" | "image">;

// Simple validation function
export function validateDepartment(
  data: DepartmentFormData
): ValidationResult<DepartmentValidationFields> {
  return {
    name: validateRequired(data.name, "Department name"),
    image: validateRequired(data.image, "Department image"),
  };
}
