import { Link } from 'react-router-dom';
import { routes } from '@/routes';

export default function NotAuthorizedPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
			<h1 className="text-3xl font-bold text-red-600 mb-4">Not Authorized</h1>
			<p className="text-lg text-gray-700 mb-6">
				You do not have permission to view this page.
				<br />
				Please contact your administrator if you believe this is a mistake.
			</p>
			<Link to={routes.home()} className="text-blue-600 hover:underline">
				Go to Home
			</Link>
		</div>
	);
}
