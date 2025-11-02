import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import FormShell from '@/components/forms/base/FormShell';
import RHFInput from '@/components/forms/rhf/RHFInput';
import { useToast } from '@/components/toast/ToastProvider';

import { useCreateUser, useUpdateUser } from '@/hooks/useUser';
import { useMunicipalities } from '@/hooks/useMunicipality';
import { useDepartments } from '@/hooks/useDepartment';

import { useCurrentUserRoles } from '@/context/AuthContext';

import type { User, UserCreateFormData, UserEditFormData } from '@/types/user';
import type { Role, RoleType } from '@/types/role';
import { DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES } from '@/types/role';

import {
	userCreateFormSchema,
	userEditFormSchema,
	type UserFormValues,
} from '@/validation/userValidation';

type UserFormProps = {
	initialData?: Partial<User>;
	isNewUser: boolean;
	onCancel?: () => void;
	onSuccess?: (user?: User) => void;
	onFailure?: (err?: unknown) => void;
};

export default function UserForm({
	initialData,
	isNewUser,
	onCancel,
	onSuccess,
	onFailure,
}: UserFormProps) {
	const toast = useToast();

	// Current user's roles and derived admin entity ids (first match if multiple)
	const currentUserRoles = useCurrentUserRoles();
	const regionAdminId =
		currentUserRoles.find(r => r.roleType === 'Region Admin')?.regionId ?? undefined;
	const municipalityAdminId =
		currentUserRoles.find(r => r.roleType === 'Municipality Admin')?.municipalityId ?? undefined;
	const departmentAdminId =
		currentUserRoles.find(r => r.roleType === 'Department Admin')?.departmentId ?? undefined;

	// Preload lists when the current user has the right admin scope
	const { municipalities, loading: loadingMunicipalities } = useMunicipalities(regionAdminId, {
		enabled: !!regionAdminId,
	});
	const { departments, loading: loadingDepartments } = useDepartments(municipalityAdminId, {
		enabled: !!municipalityAdminId,
	});

	// Determine which role types can be assigned by the current user
	const availableRoles: RoleType[] = useMemo(() => {
		const available = new Set<RoleType>();
		for (const { roleType } of currentUserRoles) {
			if (roleType === 'Department Admin') {
				DEPARTMENT_ROLES.forEach(r => available.add(r));
			}
			if (roleType === 'Municipality Admin') {
				MUNICIPALITY_ROLES.forEach(r => available.add(r));
				available.add('Department Admin');
			}
			if (roleType === 'Region Admin') {
				REGION_ROLES.forEach(r => available.add(r));
				available.add('Municipality Admin');
			}
		}
		return Array.from(available);
	}, [currentUserRoles]);

	// Form setup
	const defaultValues: UserFormValues = useMemo(
		() => ({
			firstName: initialData?.firstName ?? '',
			lastName: initialData?.lastName ?? '',
			email: initialData?.email ?? '',
			mobile: initialData?.mobile ?? '',
			password: '',
			roles: initialData?.roles ?? [],
		}),
		[initialData]
	);

	const schema = isNewUser ? userCreateFormSchema : userEditFormSchema;
	const methods = useForm<UserFormValues>({
		resolver: zodResolver(schema),
		defaultValues,
		mode: 'onSubmit',
	});
	const { reset, setValue } = methods;

	// Local state for roles UI; keep in sync with RHF for validation/submission
	const [selectedRoles, setSelectedRoles] = useState<Role[]>(defaultValues.roles);
	useEffect(() => {
		setSelectedRoles(defaultValues.roles);
		reset(defaultValues);
	}, [defaultValues, reset]);
	useEffect(() => {
		setValue('roles', selectedRoles, { shouldValidate: true, shouldDirty: true });
	}, [selectedRoles, setValue]);

	const { submit: createUser, loading: createLoading } = useCreateUser();
	const { submit: updateUser, loading: updateLoading } = useUpdateUser();

	const [serverValidation, setServerValidation] = useState<Record<string, string> | null>(null);

	// Helpers to map role type to expected entity scope
	const getEntityScope = (
		roleType: RoleType
	): 'department' | 'municipality' | 'region' | 'none' => {
		if ((DEPARTMENT_ROLES as readonly RoleType[]).includes(roleType)) return 'department';
		if ((MUNICIPALITY_ROLES as readonly RoleType[]).includes(roleType)) return 'municipality';
		if ((REGION_ROLES as readonly RoleType[]).includes(roleType)) return 'region';
		return 'none';
	};

	// Toggle a role on/off; when adding, auto-assign entity by simplified rules
	const handleRoleToggle = (roleType: RoleType) => {
		setSelectedRoles(prev => {
			const exists = prev.find(r => r.roleType === roleType);
			if (exists) return prev.filter(r => r.roleType !== roleType);

			const scope = getEntityScope(roleType);
			const newRole: Role = { roleType, departmentId: null, municipalityId: null, regionId: null };

			if (scope === 'region') {
				newRole.regionId = regionAdminId ?? null; // assign to "your region"
			} else if (scope === 'municipality') {
				if (!loadingMunicipalities && municipalities && municipalities.length > 0) {
					newRole.municipalityId = municipalities[0]?.municipalityId ?? null;
				} else {
					newRole.municipalityId = municipalityAdminId ?? null; // assign to "your municipality"
				}
			} else if (scope === 'department') {
				if (!loadingDepartments && departments && departments.length > 0) {
					newRole.departmentId = departments[0]?.departmentId ?? null;
				} else {
					newRole.departmentId = departmentAdminId ?? null; // assign to "your department"
				}
			}

			return [...prev, newRole];
		});
	};

	// When a dropdown is visible, update the selected entity id for that role
	const handleRoleEntityChange = (
		roleType: RoleType,
		entityType: 'departmentId' | 'municipalityId' | 'regionId',
		value: number | null
	) => {
		const expected = getEntityScope(roleType);
		setSelectedRoles(prev =>
			prev.map(role => {
				if (role.roleType !== roleType) return role;
				if (expected === 'department')
					return {
						...role,
						departmentId: entityType === 'departmentId' ? value : role.departmentId,
						municipalityId: null,
						regionId: null,
					};
				if (expected === 'municipality')
					return {
						...role,
						departmentId: null,
						municipalityId: entityType === 'municipalityId' ? value : role.municipalityId,
						regionId: null,
					};
				if (expected === 'region')
					return {
						...role,
						departmentId: null,
						municipalityId: null,
						regionId: entityType === 'regionId' ? value : role.regionId,
					};
				return { ...role, departmentId: null, municipalityId: null, regionId: null };
			})
		);
	};

	const onSubmit = async (values: UserFormValues) => {
		setServerValidation(null);
		try {
			if (isNewUser) {
				const formData: UserCreateFormData = { ...values, roles: selectedRoles };
				const success = await createUser(formData);
				if (success) {
					toast.showSuccess('User created successfully');
					onSuccess?.();
				}
			} else {
				const formData: UserEditFormData = {
					userId: initialData?.userId ?? 0,
					firstName: values.firstName,
					lastName: values.lastName,
					email: values.email,
					mobile: values.mobile,
					// Only include password if provided (backend treats empty as "keep current")
					...(values.password && values.password.trim().length > 0
						? { password: values.password }
						: {}),
					roles: selectedRoles,
				};
				const success = await updateUser(formData);
				if (success) {
					toast.showSuccess('User updated successfully');
					onSuccess?.();
				}
			}
		} catch (err) {
			const apiErr = err as { validationErrors?: Record<string, string>; message?: string };
			if (apiErr.validationErrors) {
				setServerValidation(apiErr.validationErrors);
				onFailure?.(apiErr);
				return;
			}
			toast.showError(apiErr.message ?? 'An unexpected error occurred while saving.');
			onFailure?.(apiErr ?? err);
		}
	};

	const isLoading = createLoading || updateLoading;

	return (
		<FormShell
			methods={methods}
			onSubmit={onSubmit}
			serverValidation={serverValidation}
			footer={{ onCancel, disabled: isLoading }}
		>
			<div>
				<h2 className="text-2xl font-semibold mb-4">
					{isNewUser ? 'Create New User' : 'Edit User'}
				</h2>
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<RHFInput name="firstName" label="First Name" placeholder="Enter first name" required />
						<RHFInput name="lastName" label="Last Name" placeholder="Enter last name" required />
					</div>
					<RHFInput name="email" label="Email" placeholder="user@example.com" required />
					<RHFInput name="mobile" label="Mobile" placeholder="+1234567890" required />
					<RHFInput
						name="password"
						type="password"
						label={isNewUser ? 'Password' : 'Password (leave blank to keep current)'}
						placeholder="Enter password"
						required={isNewUser}
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Roles <span className="text-red-500">*</span>
						</label>
						<div className="space-y-2">
							{availableRoles.map(roleType => {
								const isSelected = selectedRoles.some(r => r.roleType === roleType);
								const role = selectedRoles.find(r => r.roleType === roleType);
								const entityType = getEntityScope(roleType);

								return (
									<div key={roleType} className="p-2">
										<div className="flex items-center">
											<input
												type="checkbox"
												id={`role-${roleType}`}
												checked={isSelected}
												onChange={() => handleRoleToggle(roleType)}
												className="w-4 h-4 text-blue-600 rounded"
											/>
											<label
												htmlFor={`role-${roleType}`}
												className="ml-2 text-sm font-medium text-gray-900"
											>
												{roleType}
											</label>
										</div>

										{isSelected && role && (
											<div className="ml-6 grid grid-cols-1 gap-2">
												{entityType === 'department' && (
													<div>
														{loadingDepartments ? (
															<select
																disabled
																className="w-full px-2 py-1 text-sm border rounded bg-gray-50"
															>
																<option>Loading departments…</option>
															</select>
														) : (
															departments &&
															departments.length > 0 && (
																<>
																	<label className="block text-xs text-gray-600 mb-1">
																		Department <span className="text-red-500">*</span>
																	</label>
																	<select
																		value={role.departmentId ?? ''}
																		onChange={e =>
																			handleRoleEntityChange(
																				roleType,
																				'departmentId',
																				e.target.value ? Number(e.target.value) : null
																			)
																		}
																		className="w-full px-2 py-1 text-sm border rounded"
																	>
																		{departments.map(d => (
																			<option key={d.departmentId} value={d.departmentId}>
																				{d.name}
																			</option>
																		))}
																	</select>
																</>
															)
														)}
													</div>
												)}

												{entityType === 'municipality' && (
													<div>
														{loadingMunicipalities ? (
															<select
																disabled
																className="w-full px-2 py-1 text-sm border rounded bg-gray-50"
															>
																<option>Loading municipalities…</option>
															</select>
														) : (
															municipalities &&
															municipalities.length > 0 && (
																<>
																	<label className="block text-xs text-gray-600 mb-1">
																		Municipality <span className="text-red-500">*</span>
																	</label>
																	<select
																		value={role.municipalityId ?? ''}
																		onChange={e =>
																			handleRoleEntityChange(
																				roleType,
																				'municipalityId',
																				e.target.value ? Number(e.target.value) : null
																			)
																		}
																		className="w-full px-2 py-1 text-sm border rounded"
																	>
																		{municipalities.map(m => (
																			<option key={m.municipalityId} value={m.municipalityId}>
																				{m.name}
																			</option>
																		))}
																	</select>
																</>
															)
														)}
													</div>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
						{selectedRoles.length === 0 && (
							<p className="text-red-500 text-sm mt-1">At least one role is required</p>
						)}
					</div>
				</div>
			</div>
		</FormShell>
	);
}
