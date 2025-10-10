import { useState } from "react";

type Department = {
  departmentId: number;
  municipalityId: number;
  name: string;
  image: string;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([
    {
      departmentId: 1,
      municipalityId: 201,
      name: "Fire Department",
      image: "/images/fire-department.png",
    },
    {
      departmentId: 2,
      municipalityId: 202,
      name: "Medical Department",
      image: "/images/medical-department.png",
    },
    {
      departmentId: 3,
      municipalityId: 203,
      name: "Police Department",
      image: "/images/police-department.png",
    },
  ]);

  const [selected, setSelected] = useState<Department | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<Department>({
    departmentId: 0,
    municipalityId: 0,
    name: "",
    image: "",
  });

  const openModal = (dept?: Department) => {
    if (dept) {
      setSelected(dept);
      setForm(dept);
    } else {
      setSelected(null);
      setForm({ departmentId: 0, municipalityId: 0, name: "", image: "" });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelected(null);
  };

  const handleSave = () => {
    if (selected) {
      // Edit
      setDepartments((prev) =>
        prev.map((d) =>
          d.departmentId === selected.departmentId ? { ...form } : d
        )
      );
    } else {
      // Add
      setDepartments((prev) => [
        ...prev,
        {
          ...form,
          departmentId: Date.now(),
          municipalityId: Math.floor(Math.random() * 1000) + 200, // فقط برای نمونه
        },
      ]);
    }
    closeModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setForm({ ...form, image: imageUrl });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments((prev) =>
        prev.filter((d) => d.departmentId !== id)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <button
            onClick={() => openModal()} >
           <img src="/images/Icons/add-button.png" alt="Add" className="w-7 h-7" />
          </button>
        </div>

        {/* Department List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((d) => (
            <div
              key={d.departmentId}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition relative"
            >
              <button
                onClick={() => handleDelete(d.departmentId)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete"
              >
                <img src="/images/Icons/delete.png" alt="Add" className="w-7 h-7" />
              </button>

              <div
                onClick={() => openModal(d)}
                className="cursor-pointer text-center"
              >
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-24 w-24 object-contain mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {d.name}
                </h3>
                <p className="text-gray-700 text-sm">
                  Municipality ID: {d.municipalityId}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selected ? "Edit Department" : "Add Department"}
            </h2>

            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded p-2 mb-3"
            />

            {/* آپلود عکس */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full border rounded p-2 mb-3"
            />
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="h-20 w-20 object-cover mx-auto mb-3 rounded"
              />
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
