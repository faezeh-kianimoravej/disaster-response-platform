import { useMemo, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import RHFSelect from '@/components/forms/rhf/RHFSelect';
import RHFCheckboxGroup from '@/components/forms/rhf/RHFCheckboxGroup';
import { RESPONDER_SPECIALIZATIONS } from '@/types/responderSpecialization';
import { useDepartments } from '@/hooks/useDepartment';
import { useCurrentUserRoles } from '@/context/AuthContext';

export default function ResponderProfileForm() {
	const { watch, setValue } = useFormContext();
	const currentUserRoles = useCurrentUserRoles();
	const municipalityAdminId = useMemo(
		() =>
			currentUserRoles.find(r => r.roleType === 'Municipality Admin')?.municipalityId ?? undefined,
		[currentUserRoles]
	);
	const departmentAdminId = useMemo(
		() => currentUserRoles.find(r => r.roleType === 'Department Admin')?.departmentId ?? undefined,
		[currentUserRoles]
	);
	const { departments, loading: loadingDepartments } = useDepartments(municipalityAdminId, {
		enabled: !!municipalityAdminId,
	});

	// Auto-set department if not already set
	useEffect(() => {
		const currentDepartmentId = watch('responderProfile.departmentId');
		if (!currentDepartmentId && departments && departments.length > 0 && departments[0]) {
			// Auto-select first available department
			setValue('responderProfile.departmentId', departments[0].departmentId);
		} else if (!currentDepartmentId && departmentAdminId) {
			// If user is department admin, auto-select their department
			setValue('responderProfile.departmentId', departmentAdminId);
		}
	}, [departments, departmentAdminId, watch, setValue]);

	return (
		<div className="space-y-4 border rounded p-4 bg-white">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Responder Profile Details</h3>
			{loadingDepartments ? (
				<div className="text-sm text-gray-600">Loading departments...</div>
			) : (
				<>
					<div className="grid grid-cols-1 gap-4">
						<RHFSelect
							name="responderProfile.primarySpecialization"
							label="Primary Specialization"
							options={RESPONDER_SPECIALIZATIONS.map(s => ({ label: s, value: s }))}
							required
						/>
						<RHFCheckboxGroup
							name="responderProfile.secondarySpecializations"
							label="Secondary Specializations (Optional)"
							options={RESPONDER_SPECIALIZATIONS.map(s => ({ label: s, value: s }))}
							className="mt-1"
						/>
					</div>
				</>
			)}
		</div>
	);
}
