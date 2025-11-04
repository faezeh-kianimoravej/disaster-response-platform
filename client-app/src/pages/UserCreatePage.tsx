import { useNavigate } from 'react-router-dom';
import { routes } from '@/routes';
import UserForm from '@/components/forms/UserForm';
import { useIsUserLoggedIn, useUserHasAnyRole } from '@/context/AuthContext';
import NotAuthorizedPage from '@/pages/NotAuthorizedPage';
import { createRoles } from '@/types/role';

export default function UserCreatePage() {
	const navigate = useNavigate();
	const isLoggedIn = useIsUserLoggedIn();
	const canCreate = useUserHasAnyRole(
		createRoles(['Region Admin', 'Municipality Admin', 'Department Admin'])
	);

	if (!isLoggedIn || !canCreate) {
		return <NotAuthorizedPage />;
	}

	const handleSuccess = (user?: { userId: number }) => {
		if (user?.userId) {
			navigate(routes.user(user.userId));
		} else {
			navigate(routes.users());
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-3xl mx-auto px-4">
				<div className="bg-white rounded-xl shadow-lg p-8">
					<UserForm
						isNewUser={true}
						onCancel={() => navigate(routes.users())}
						onSuccess={handleSuccess}
					/>
				</div>
			</div>
		</div>
	);
}
