import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getResourceById, updateResource, deleteResource } from '@/data/resources';
import type { Resource } from '@/data/resources';
import Button from '@/components/Button';

export default function ResourcePage() {
	const { resourceId } = useParams();
	const id = resourceId ? Number(resourceId) : NaN;
	const navigate = useNavigate();

	const [resource, setResource] = useState<Resource | null>(null);
	const [editing, setEditing] = useState(false);
	type FormState = { name: string; description: string; quantity: number; available: number };
	const [form, setForm] = useState<FormState>({
		name: '',
		description: '',
		quantity: 0,
		available: 0,
	});

	useEffect(() => {
		const r = getResourceById(id);
		if (!r) return;
		setResource(r);
		setForm({
			name: r.name,
			description: r.description,
			quantity: r.quantity,
			available: r.available,
		});
	}, [id]);

	// if the id parsed is invalid, go back to resources list
	useEffect(() => {
		if (isNaN(id)) {
			navigate('/resources');
		}
	}, [id, navigate]);

	if (!resource) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4">
					<h2 className="text-2xl font-semibold">Resource not found</h2>
					<p className="mt-4">The requested resource was not found.</p>
				</div>
			</div>
		);
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		const { name, value } = e.target;
		setForm(prev => ({
			...prev,
			[name]: name === 'quantity' || name === 'available' ? Number(value) : value,
		}));
	}

	function handleSave() {
		if (!resource) return;
		const updated: Resource = {
			resourceId: resource.resourceId,
			departmentId: resource.departmentId,
			resourceType: resource.resourceType,
			image: resource.image,
			name: form.name,
			description: form.description,
			quantity: form.quantity,
			available: form.available,
		};

		const ok = updateResource(updated);
		if (ok) {
			setResource(updated);
			setEditing(false);
		}
	}

	function handleDelete() {
		if (!resource) return;
		// confirmation

		if (!confirm(`Delete resource "${resource.name}"? This cannot be undone.`)) return;
		const ok = deleteResource(resource.resourceId);
		if (ok) navigate('/resources');
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="flex items-start space-x-6">
						<img src={resource.image} alt={resource.name} className="h-32 w-32 object-contain" />
						<div className="flex-1">
							{!editing ? (
								<>
									<h2 className="text-2xl font-semibold">{resource.name}</h2>
									<p className="text-gray-600 mt-2">{resource.description}</p>
									<div className="mt-4 text-gray-700">
										<p>
											<strong>Quantity:</strong> {resource.quantity}
										</p>
										<p>
											<strong>Available:</strong> {resource.available}
										</p>
										<p>
											<strong>Type:</strong> {resource.resourceType}
										</p>
									</div>
									<div className="mt-6 flex space-x-3">
										<Button onClick={() => setEditing(true)} variant="primary">
											Edit
										</Button>
										<Button onClick={handleDelete} variant="danger">
											Delete
										</Button>
										<Button onClick={() => navigate('/resources')} variant="outline">
											Back
										</Button>
									</div>
								</>
							) : (
								<div>
									<div className="space-y-3">
										<div>
											<label className="block text-sm font-medium">Name</label>
											<input
												name="name"
												value={form.name}
												onChange={handleChange}
												className="mt-1 block w-full border rounded p-2"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium">Description</label>
											<textarea
												name="description"
												value={form.description}
												onChange={handleChange}
												className="mt-1 block w-full border rounded p-2"
											/>
										</div>
										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-sm font-medium">Quantity</label>
												<input
													type="number"
													name="quantity"
													value={form.quantity}
													onChange={handleChange}
													className="mt-1 block w-full border rounded p-2"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium">Available</label>
												<input
													type="number"
													name="available"
													value={form.available}
													onChange={handleChange}
													className="mt-1 block w-full border rounded p-2"
												/>
											</div>
										</div>
									</div>
									<div className="mt-6 flex space-x-3">
										<Button onClick={handleSave} variant="success">
											Save
										</Button>
										<Button onClick={() => setEditing(false)} variant="outline">
											Cancel
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
