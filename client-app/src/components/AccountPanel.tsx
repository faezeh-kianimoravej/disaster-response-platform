import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, X } from 'lucide-react';
import { useAuth, useCurrentUserRoles } from '@/context/AuthContext';
import type { Role } from '@/types/role';
import { ALL_ROLES } from '@/types/role';

export default function AccountPanel() {
	const auth = useAuth();
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
	const currentRoles = useCurrentUserRoles();

	function toggleLoggedIn(checked: boolean) {
		if (!auth?.setAuth) return;
		if (!checked) {
			auth.setAuth({ isLoggedIn: false, user: null, token: undefined });
			return;
		}
		// turning on: restore a minimal user if none
		const restoredUser = user ?? {
			userId: 0,
			firstName: 'User',
			lastName: '',
			email: '',
			mobile: '',
			roles: [],
			departmentId: undefined,
			municipalityId: undefined,
			regionId: undefined,
		};
		auth.setAuth({ isLoggedIn: true, user: restoredUser, token: auth.token ?? 'mock-token' });
	}

	function toggleRole(role: Role, checked: boolean) {
		if (!auth?.updateUser) return;
		const current = auth?.user?.roles ?? [];
		let next: Role[];
		if (checked) {
			next = Array.from(new Set([...current, role]));
		} else {
			next = current.filter(r => r !== role);
		}
		auth.updateUser({ roles: next });
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
							<div>
								<div className="text-sm font-semibold text-gray-900">
									{user ? `${user.firstName} ${user.lastName}` : 'No user'}
								</div>
								<div className="text-xs text-gray-500">Manage authentication</div>
							</div>
							<button
								onClick={() => setIsOpen(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<X size={18} />
							</button>
						</div>
					</div>

					<div className="p-4 space-y-3">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={!!auth?.isLoggedIn}
								onChange={e => toggleLoggedIn(e.target.checked)}
							/>
							<span className="text-sm">Logged In</span>
						</label>

						<div>
							<div className="text-xs text-gray-600">Roles</div>
							<div className="mt-1 text-sm text-gray-800">
								{auth?.user?.roles?.join(', ') ?? ''}
							</div>
							<div className="mt-2 grid grid-cols-2 gap-2 max-h-40 overflow-auto">
								{ALL_ROLES.map(r => (
									<label key={r} className="flex items-center gap-2 text-sm">
										<input
											type="checkbox"
											checked={currentRoles.includes(r)}
											onChange={e => toggleRole(r, e.target.checked)}
										/>
										<span>{r}</span>
									</label>
								))}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="block text-xs text-gray-600">Department ID</label>
								<input
									type="number"
									className="mt-1 block w-full border rounded p-1 border-gray-300"
									value={auth?.user?.departmentId ?? ''}
									onChange={e => {
										const val = e.target.value === '' ? undefined : Number(e.target.value);
										if (auth?.updateUser) auth.updateUser({ departmentId: val });
									}}
								/>
							</div>

							<div>
								<label className="block text-xs text-gray-600">Municipality ID</label>
								<input
									type="number"
									className="mt-1 block w-full border rounded p-1 border-gray-300"
									value={auth?.user?.municipalityId ?? ''}
									onChange={e => {
										const val = e.target.value === '' ? undefined : Number(e.target.value);
										if (auth?.updateUser) auth.updateUser({ municipalityId: val });
									}}
								/>
							</div>
						</div>

						<div>
							<label className="block text-xs text-gray-600">Region ID</label>
							<input
								type="number"
								className="mt-1 block w-full border rounded p-1 border-gray-300"
								value={auth?.user?.regionId ?? ''}
								onChange={e => {
									const val = e.target.value === '' ? undefined : Number(e.target.value);
									if (auth?.updateUser) auth.updateUser({ regionId: val });
								}}
							/>
						</div>

						<div className="flex justify-end">
							<button
								onClick={() => setIsOpen(false)}
								className="px-3 py-1 text-sm text-gray-700 rounded border border-gray-200 hover:bg-gray-50"
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
