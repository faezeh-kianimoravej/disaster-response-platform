const resourcesData = [
  {
    resourceId: 1,
    departmentId: 101,
    name: "Medical Supplies",
    description: "First aid kits and medicines",
    quantity: 150,
    available: 120,
    resourceType: "Medical",
    image: "/images/first-aid-box.png",
  },
  {
    resourceId: 2,
    departmentId: 102,
    name: "Emergency Vehicles",
    description: "Ambulances and fire trucks",
    quantity: 25,
    available: 23,
    resourceType: "Vehicle",
    image: "/images/ambulance.png",
  },
  {
    resourceId: 3,
    departmentId: 103,
    name: "Personnel",
    description: "On-duty emergency staff",
    quantity: 50,
    available: 39,
    resourceType: "Human",
    image: "/images/response.png",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Resource Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourcesData.map((r) => (
            <div key={r.resourceId} className="bg-white rounded-lg shadow-md p-6">
              <img
                src={r.image}
                alt={r.name}
                className="h-24 w-24 object-contain mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{r.name}</h3>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
