import { useEffect, useRef, useState } from 'react';
import { User as UserIcon, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useKeycloak } from '@/context/KeycloakProvider';

export default function AccountPanel() {
	const auth = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement | null>(null);
	const { isAuthenticated, login, logout } = useKeycloak();

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
									{user?.firstName && user.firstName.trim()
										? `${user.firstName} ${user.lastName || ''}`.trim()
										: user?.email || 'Not logged in'}
								</div>
								{user?.email && user.firstName && user.firstName.trim() && (
									<div className="text-xs text-gray-500">{user.email}</div>
								)}
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
									<div className="text-xs font-semibold text-gray-600 mb-2">Your Roles</div>
									<div className="space-y-2">
										{currentRoles.length === 0 && (
											<div className="text-sm text-gray-500 italic">No roles assigned</div>
										)}
										{currentRoles.map((role, idx) => (
											<div key={idx} className="text-sm bg-gray-50 p-2 rounded">
												<div className="font-medium">{role.roleType}</div>
											</div>
										))}
									</div>
								</div>
							</>
						)}

						<div className="flex justify-between pt-2">
							{isAuthenticated ? (
								<button
									onClick={handleLogout}
									className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded"
								>
									<LogOut size={16} />
									Logout
								</button>
							) : (
								<div className="flex items-center gap-2">
									<div className="text-sm text-gray-500">Please login</div>
									<button
										onClick={login}
										className="text-sm text-blue-600 hover:underline px-2 py-1 rounded border border-blue-200 bg-blue-50"
									>
										Login
									</button>
								</div>
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
