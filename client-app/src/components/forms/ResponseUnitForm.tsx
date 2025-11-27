import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import FormShell from '@/components/forms/base/FormShell';
import RHFInput from '@/components/forms/rhf/RHFInput';
import {
	RESPONSE_UNIT_TYPES,
	type ResponseUnitFormData,
	type ResponseUnit,
} from '@/types/responseUnit';
import type { Resource } from '@/types/resource';
import type { User } from '@/types/user';
import { useToast } from '@/components/toast/ToastProvider';
import { useCreateResponseUnit, useUpdateResponseUnit } from '@/hooks/useResponseUnit';
import { useResources } from '@/hooks/useResource';
import { useUsersByDepartment } from '@/hooks/useUser';
import { routes } from '@/routes';

// Form validation schema matching the simpler form structure
const responseUnitFormSchema = z.object({
	unitName: z.string().min(1, 'Unit name is required'),
	unitType: z.enum(RESPONSE_UNIT_TYPES),
	departmentId: z.number(),
	selectedResources: z.array(z.number()).default([]),
	selectedPersonnel: z.array(z.number()).default([]),
});

type FormData = z.infer<typeof responseUnitFormSchema>;

interface ResponseUnitFormProps {
	initialData?: ResponseUnit;
	departmentId: number;
	onCancel: () => void;
	onSaved?: () => void;
	onRefetch?: () => void;
}

export default function ResponseUnitForm({
	initialData,
	departmentId,
	onCancel,
	onSaved,
	onRefetch,
}: ResponseUnitFormProps) {
	const navigate = useNavigate();
	const { showSuccess } = useToast();

	const createMutation = useCreateResponseUnit();
	const updateMutation = useUpdateResponseUnit();
	const { resources } = useResources(departmentId);
	const { users } = useUsersByDepartment(departmentId);

	const defaultValues: FormData = useMemo(
		() => ({
			unitName: initialData?.unitName ?? '',
			unitType: initialData?.unitType ?? RESPONSE_UNIT_TYPES[0],
			departmentId: initialData?.departmentId ?? departmentId,
			selectedResources: initialData?.defaultResources?.map(r => r.resourceId) ?? [],
			selectedPersonnel:
				initialData?.defaultPersonnel
					?.filter(p => p.userId !== undefined)
					?.map(p => p.userId!) ?? [],
		}),
		[initialData, departmentId]
	);

	const methods = useForm<FormData>({
		resolver: zodResolver(responseUnitFormSchema),
		defaultValues,
	});

	const isNewResponseUnit = !initialData;

	async function handleSubmit(values: FormData) {
		try {
			// Transform form data to API format - matching Swagger definition exactly
			const payload: ResponseUnitFormData = {
				unitName: values.unitName,
				departmentId: values.departmentId,
				unitType: values.unitType,
				defaultResources: values.selectedResources.map(resourceId => ({
					resourceId,
					quantity: 1,
					isPrimary: false,
				})),
				defaultPersonnel: values.selectedPersonnel.map(userId => {
					const user = users.find(u => u.userId === userId);
					const specialization = user?.responderProfile?.primarySpecialization || 'FIREFIGHTER';
					return {
						userId,
						specialization,
						isRequired: true,
					};
				}),
			};

			if (isNewResponseUnit) {
				const created = await createMutation.mutateAsync({
					form: payload,
					status: 'AVAILABLE' as const,
				});
				showSuccess(`Response Unit "${created.unitName}" has been created successfully!`);
				navigate(routes.resources(departmentId));
			} else if (initialData) {
				const updated = await updateMutation.mutateAsync({
					unitId: initialData.unitId!,
					form: payload,
					status: 'AVAILABLE' as const,
				});
				showSuccess(`Response Unit "${updated.unitName}" has been updated successfully!`);
				onRefetch?.(); // Refresh the data
				onSaved?.(); // Switch back to view mode after successful edit
			}

			// Only navigate away if it's a new response unit
		} catch (error: unknown) {
			// Handle validation errors - log to monitoring service in production
			if (error instanceof Error) {
				// Handle the error appropriately in production
			}
		}
	}

	return (
		<FormShell methods={methods} onSubmit={handleSubmit} footer={{ onCancel }}>
			<div>
				<h2 className="text-2xl font-semibold mb-4">
					{isNewResponseUnit ? 'Create New Response Unit' : 'Edit Response Unit'}
				</h2>

				<div className="space-y-3">
					<RHFInput name="unitName" label="Unit Name" placeholder="Enter unit name" required />

					<RHFInput
						name="unitType"
						label="Unit Type"
						type="select"
						options={RESPONSE_UNIT_TYPES.map(type => ({ value: type, label: type }))}
						required
					/>

					{/* Resources Section */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">Default Resources</label>
						<p className="text-sm text-gray-600">
							Select resources that should be automatically assigned to this response unit.
						</p>
						<div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
							{resources.map((resource: Resource) => (
								<label key={resource.resourceId} className="flex items-center space-x-2">
									<input
										type="checkbox"
										className="rounded border-gray-300"
										checked={methods.watch('selectedResources').includes(resource.resourceId)}
										onChange={e => {
											const current = methods.getValues('selectedResources');
											if (e.target.checked) {
												methods.setValue('selectedResources', [...current, resource.resourceId]);
											} else {
												methods.setValue(
													'selectedResources',
													current.filter(id => id !== resource.resourceId)
												);
											}
										}}
									/>
									<span className="text-sm">
										{resource.name} ({resource.resourceType})
									</span>
								</label>
							))}
						</div>
					</div>

					{/* Personnel Section */}
					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700">Default Personnel</label>
						<p className="text-sm text-gray-600">
							Select personnel that should be automatically assigned to this response unit.
						</p>
						<div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
							{users
								.filter(user => user.responderProfile?.primarySpecialization)
								.map((user: User) => (
									<label key={user.userId} className="flex items-center space-x-2">
										<input
											type="checkbox"
											className="rounded border-gray-300"
											checked={methods.watch('selectedPersonnel').includes(user.userId)}
											onChange={e => {
												const current = methods.getValues('selectedPersonnel');
												if (e.target.checked) {
													methods.setValue('selectedPersonnel', [...current, user.userId]);
												} else {
													methods.setValue(
														'selectedPersonnel',
														current.filter(id => id !== user.userId)
													);
												}
											}}
										/>
										<span className="text-sm">
											{user.firstName} {user.lastName} (Responder - {user.responderProfile?.primarySpecialization?.toLowerCase()})
										</span>
									</label>
								))}
						</div>
					</div>
				</div>
			</div>
		</FormShell>
	);
}
