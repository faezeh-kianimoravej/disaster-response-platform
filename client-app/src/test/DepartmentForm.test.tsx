import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DepartmentForm from "../Department/DepartmentForm";
import { ToastProvider } from "@/components/ToastProvider";
import type { Department } from "../Department/types";

// Helper to render with Toast context
const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe("DepartmentForm component", () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnImageChange = vi.fn();

  const defaultProps = {
    isNewDepartment: true,
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    onImageChange: mockOnImageChange,
  };

  const existingDepartment: Partial<Department> = {
    departmentId: 1,
    municipalityId: 201,
    name: "Medical Department",
    image: "/images/medical-department.png",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- Rendering ----------
  describe("Rendering", () => {
    it("renders all form fields", () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      expect(screen.getByLabelText(/Department Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Image URL/i)).toBeInTheDocument();
    });

    it("shows Create button for new department", () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: /Create/i })).toBeInTheDocument();
    });

    it("shows Save button for editing department", () => {
      renderWithToast(
        <DepartmentForm {...defaultProps} isNewDepartment={false} initialData={existingDepartment} />
      );
      expect(screen.getByRole("button", { name: /Save/i })).toBeInTheDocument();
    });

    it("renders Cancel button", () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  // ---------- Initialization ----------
  describe("Initialization", () => {
    it("loads empty fields for new department", () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      expect(screen.getByLabelText(/Department Name/i)).toHaveValue("");
    });

    it("loads existing department data when editing", () => {
      renderWithToast(
        <DepartmentForm {...defaultProps} isNewDepartment={false} initialData={existingDepartment} />
      );
      expect(screen.getByDisplayValue("Medical Department")).toBeInTheDocument();
    });
  });

  // ---------- Validation ----------
  describe("Validation", () => {
    it("shows error when department name is empty", async () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      const createButton = screen.getByRole("button", { name: /Create/i });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/Please fix the following errors/i)).toBeInTheDocument();
      });
    });

    it("disables Save button when form is invalid", () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      const button = screen.getByRole("button", { name: /Create/i });
      expect(button).toHaveClass("bg-gray-300"); // disabled style
    });
  });

  // ---------- Interactions ----------
  describe("Interactions", () => {
    it("updates name field when user types", () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      const nameInput = screen.getByLabelText(/Department Name/i);
      fireEvent.change(nameInput, { target: { value: "Fire Department" } });
      expect(screen.getByDisplayValue("Fire Department")).toBeInTheDocument();
    });

    it("calls onCancel when Cancel is clicked", () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it.skip("calls onSave with valid form data", async () => {
      renderWithToast(<DepartmentForm {...defaultProps} />);
      const nameInput = screen.getByLabelText(/Department Name/i);
      const imageInput = screen.getByLabelText(/Image URL/i);

      fireEvent.change(nameInput, { target: { value: "Fire Department" } });
      const file = new File(["dummy content"], "test.png", { type: "image/png" });
      fireEvent.change(imageInput, { target: { files: [file] } });
      const saveButton = screen.getByRole("button", { name: /Create/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Fire Department",
            image: "/images/fire.png",
          })
        );
      });
    });
  });
});
