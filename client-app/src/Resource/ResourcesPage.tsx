import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getResources } from "./api";
import Button from "@/components/Button";
import type { Resource } from "./types";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await getResources();
        setResources(data);
      } catch (err) {
        console.error("Failed to load resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleAddNew = () => {
    navigate("/resources/new");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
        <p className="text-gray-600">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
          <Button onClick={handleAddNew} variant="primary">
            Add New Resource
          </Button>
        </div>

        {resources.length === 0 ? (
          <p className="text-center text-gray-600">No resources available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <Link
                key={r.resourceId}
                to={`/resources/${r.resourceId}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <img
                  src={r.image}
                  alt={r.name}
                  className="h-24 w-24 object-contain mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {r.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{r.description}</p>
                <p className="text-gray-700">
                  <strong>Quantity:</strong> {r.quantity}
                </p>
                <p className="text-gray-700">
                  <strong>Available:</strong> {r.available}
                </p>
                <p className="text-gray-700">
                  <strong>Type:</strong> {r.resourceType}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
