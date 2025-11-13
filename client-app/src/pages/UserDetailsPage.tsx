import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import { useUser, useRemoveUser } from '@/hooks/useUser';
import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import UserForm from '@/components/forms/UserForm';
import { ADMIN_ROLES } from '@/types/role';
import { useToast } from '@/components/toast/ToastProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';

export default function UserDetailsPage() {
	return (
		<AuthGuard requireRoles={[...ADMIN_ROLES]}>
			<UserDetailsPageContent />
		</AuthGuard>
	);
}

function UserDetailsPageContent() {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const auth = useAuth();
	const { user, loading, error, refetch } = useUser(userId ? Number(userId) : undefined);
	const { remove, loading: deleteLoading } = useRemoveUser();
	const [isEditMode, setIsEditMode] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const toast = useToast();

	// Check if the current user is viewing their own profile
	const isCurrentUser = Boolean(auth?.user?.email && user?.email && auth.user.email === user.email);

	useEffect(() => {
		if (userId) void refetch();
	}, [userId, refetch]);

	const showSingleError = useSingleErrorToast();
	useEffect(() => {
		const key = userId ? `user.${userId}` : 'user.none';
		showSingleError({ key, error, loading, message: 'Unable to load user.' });
	}, [userId, error, loading, showSingleError]);

	const handleDelete = () => {
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!userId || !user) return;

		const success = await remove(userId);
		if (success) {
			toast.showSuccess('User deleted successfully');
			navigate(routes.users());
		} else {
			toast.showError('Failed to delete user');
		}
		setShowDeleteModal(false);
	};

	const handleEditSuccess = () => {
		setIsEditMode(false);
		if (userId) void refetch();
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-3xl mx-auto px-4">
				<div className="bg-white rounded-xl shadow-lg p-8">
					<section aria-busy={loading} aria-live="polite">
						{loading ? (
							<LoadingPanel text="Loading user..." />
						) : error ? (
							<div className="mb-4">
								<ErrorRetryBlock message="Unable to load user." onRetry={() => refetch()} />
							</div>
						) : user ? (
							<>
								{isEditMode ? (
									<UserForm
										isNewUser={false}
										initialData={user}
										onCancel={() => setIsEditMode(false)}
										onSuccess={handleEditSuccess}
									/>
								) : (
									<>
										<div className="flex items-center mb-6">
											<div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 mr-6">
												{user.firstName[0]}
												{user.lastName[0]}
											</div>
											<div>
												<h1 className="text-2xl font-bold text-gray-900 mb-1">
													{user.firstName} {user.lastName}
												</h1>
												<div className="flex flex-wrap gap-2">
													{user.roles.map((role, idx) => (
														<span
															key={idx}
															className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
														>
															{role.roleType}
														</span>
													))}
												</div>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
											<div>
												<div className="text-gray-500 text-xs uppercase mb-1">Email</div>
												<div className="text-gray-900 font-medium">{user.email}</div>
											</div>
											<div>
												<div className="text-gray-500 text-xs uppercase mb-1">Mobile</div>
												<div className="text-gray-900 font-medium">{user.mobile}</div>
											</div>
											<div className="md:col-span-2">
												<div className="text-gray-500 text-xs uppercase mb-2">
													Roles & Associations
												</div>
												<div className="space-y-2">
													{user.roles.map((role, idx) => (
														<div key={idx} className="text-sm text-gray-900">
															<span className="font-medium">{role.roleType}</span>
															{(role.regionId || role.municipalityId || role.departmentId) && (
																<span className="text-gray-600">
																	{' '}
																	-{role.regionId && ` Region: ${role.regionId}`}
																	{role.municipalityId && ` Municipality: ${role.municipalityId}`}
																	{role.departmentId && ` Department: ${role.departmentId}`}
																</span>
															)}
														</div>
													))}
												</div>
											</div>
										</div>
										{/* Responder Specialization */}
										{user.responderProfile && (
											<div className="md:col-span-2 mb-4">
												<div className="text-gray-500 text-xs uppercase mb-2">
													Responder Specialization
												</div>
												<div className="space-y-1">
													<div>
														<span className="font-medium">Primary:</span>{' '}
														<span className="text-blue-800">
															{user.responderProfile.primarySpecialization}
														</span>
													</div>
													{user.responderProfile.secondarySpecializations &&
														user.responderProfile.secondarySpecializations.length > 0 && (
															<div>
																<span className="font-medium">Secondary:</span>{' '}
																<span className="text-blue-800">
																	{user.responderProfile.secondarySpecializations.join(', ')}
																</span>
															</div>
														)}
												</div>
											</div>
										)}
										<div className="flex flex-wrap gap-2 justify-end mt-8">
											<Button variant="outline" onClick={() => navigate(-1)}>
												Back
											</Button>
											<Button variant="primary" onClick={() => setIsEditMode(true)}>
												Edit
											</Button>
											<Button
												variant="danger"
												onClick={handleDelete}
												disabled={deleteLoading || isCurrentUser}
												title={isCurrentUser ? 'You cannot delete yourself' : undefined}
											>
												{deleteLoading ? 'Deleting...' : 'Delete'}
											</Button>
										</div>
									</>
								)}
							</>
						) : (
							<div className="text-gray-500">User not found.</div>
						)}
					</section>
				</div>
			</div>
			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				title="Delete User"
				message={`Are you sure you want to delete ${user?.firstName} ${user?.lastName}? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				onConfirm={confirmDelete}
				onCancel={() => setShowDeleteModal(false)}
			/>
		</div>
	);
}
