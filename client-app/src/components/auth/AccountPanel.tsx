import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/hooks/useLogin';
import type { Role, RoleType } from '@/types/role';
import { ALL_ROLES, DEPARTMENT_ROLES, MUNICIPALITY_ROLES, REGION_ROLES } from '@/types/role';

export default function AccountPanel() {
	const auth = useAuth();
	const { logout } = useLogin();
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		if (isOpen) document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	const user = auth?.user ?? null;
	const currentRoles = user?.roles ?? [];

	function handleLogout() {
		logout();
		setIsOpen(false);
	}

	// Helper to check if a role type is in the user's roles
	function hasRoleType(roleType: RoleType): boolean {
		return currentRoles.some(r => r.roleType === roleType);
	}

	// Helper to get a specific role by type
	function getRoleByType(roleType: RoleType): Role | undefined {
		return currentRoles.find(r => r.roleType === roleType);
	}

	// Toggle a role on/off
	function toggleRole(roleType: RoleType, checked: boolean) {
		if (!auth?.updateUser || !user) return;

		let nextRoles: Role[];
		if (checked) {
			// Add the role with null entity IDs
			const newRole: Role = {
				roleType,
				departmentId: null,
				municipalityId: null,
				regionId: null,
			};
			nextRoles = [...currentRoles, newRole];
		} else {
			// Remove the role
			nextRoles = currentRoles.filter(r => r.roleType !== roleType);
		}

		auth.updateUser({ roles: nextRoles });
	}

	// Determine which entity type a roleType belongs to
	function getEntityType(roleType: RoleType): 'department' | 'municipality' | 'region' | 'none' {
		if ((DEPARTMENT_ROLES as readonly RoleType[]).includes(roleType)) return 'department';
		if ((MUNICIPALITY_ROLES as readonly RoleType[]).includes(roleType)) return 'municipality';
		if ((REGION_ROLES as readonly RoleType[]).includes(roleType)) return 'region';
		return 'none';
	}

	// Update entity ID for a specific role (and clear others to enforce max 1 id)
	function updateRoleEntity(
		roleType: RoleType,
		field: 'departmentId' | 'municipalityId' | 'regionId',
		value: number | null
	) {
		if (!auth?.updateUser || !user) return;

		const entityType = getEntityType(roleType);
		const nextRoles = currentRoles.map(r => {
			if (r.roleType === roleType) {
				// Only allow writing the proper field; clear others
				return {
					...r,
					departmentId: entityType === 'department' && field === 'departmentId' ? value : null,
					municipalityId:
						entityType === 'municipality' && field === 'municipalityId' ? value : null,
					regionId: entityType === 'region' && field === 'regionId' ? value : null,
				};
			}
			return r;
		});

		auth.updateUser({ roles: nextRoles });
	}

	return (
		<div className="relative" ref={panelRef}>
			<button
				onClick={() => setIsOpen(v => !v)}
				className="p-2 text-white hover:text-blue-200 transition-colors"
				aria-label="Account"
			>
				<UserIcon size={24} />
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
					<div className="p-4 border-b border-gray-200">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<div className="text-sm font-semibold text-gray-900">
									{user ? `${user.firstName} ${user.lastName}` : 'Not logged in'}
								</div>
								<div className="text-xs text-gray-500">{user?.email}</div>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X size={18} />
							</button>
						</div>
					</div>

					<div className="p-4 space-y-4">
						{user && (
							<>
								<div>
									<div className="text-xs font-semibold text-gray-600 mb-2">Current Roles</div>
									<div className="space-y-2">
										{currentRoles.length === 0 && (
											<div className="text-sm text-gray-500 italic">No roles assigned</div>
										)}
										{currentRoles.map((role, idx) => (
											<div key={idx} className="text-sm bg-gray-50 p-2 rounded">
												<div className="font-medium">{role.roleType}</div>
												<div className="text-xs text-gray-600 mt-1 grid grid-cols-3 gap-2">
													{role.departmentId && <span>Dept: {role.departmentId}</span>}
													{role.municipalityId && <span>Muni: {role.municipalityId}</span>}
													{role.regionId && <span>Region: {role.regionId}</span>}
												</div>
											</div>
										))}
									</div>
								</div>

								<div className="pt-2 border-t">
									<div className="text-xs font-semibold text-gray-600 mb-2">
										Toggle Roles (Dev Only)
									</div>
									<div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
										{ALL_ROLES.map(roleType => {
											const hasRole = hasRoleType(roleType);
											const role = getRoleByType(roleType);
											const entityType = getEntityType(roleType);

											return (
												<div key={roleType} className="space-y-1">
													<label className="flex items-center gap-2 text-sm">
														<input
															type="checkbox"
															checked={hasRole}
															onChange={e => toggleRole(roleType, e.target.checked)}
														/>
														<span className="text-xs">{roleType}</span>
													</label>

													{hasRole && role && (
														<div className="ml-6 space-y-1">
															{entityType === 'department' && (
																<input
																	type="number"
																	placeholder="Dept ID"
																	className="w-full text-xs border rounded px-1 py-0.5"
																	value={role.departmentId ?? ''}
																	onChange={e => {
																		const val =
																			e.target.value === '' ? null : Number(e.target.value);
																		updateRoleEntity(roleType, 'departmentId', val);
																	}}
																/>
															)}
															{entityType === 'municipality' && (
																<input
																	type="number"
																	placeholder="Muni ID"
																	className="w-full text-xs border rounded px-1 py-0.5"
																	value={role.municipalityId ?? ''}
																	onChange={e => {
																		const val =
																			e.target.value === '' ? null : Number(e.target.value);
																		updateRoleEntity(roleType, 'municipalityId', val);
																	}}
																/>
															)}
															{entityType === 'region' && (
																<input
																	type="number"
																	placeholder="Region ID"
																	className="w-full text-xs border rounded px-1 py-0.5"
																	value={role.regionId ?? ''}
																	onChange={e => {
																		const val =
																			e.target.value === '' ? null : Number(e.target.value);
																		updateRoleEntity(roleType, 'regionId', val);
																	}}
																/>
															)}
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							</>
						)}

						<div className="flex justify-between pt-2 border-t">
							{user ? (
								<button
									onClick={handleLogout}
									className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
								>
									<LogOut size={16} />
									Logout
								</button>
							) : (
								<div className="text-sm text-gray-500">Please login</div>
							)}
							<button
								onClick={() => setIsOpen(false)}
								className="px-3 py-1.5 text-sm text-gray-700 rounded border border-gray-200 hover:bg-gray-50"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
