import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { routes } from '@/routes';
import { useIncident } from '@/hooks/useIncident';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import Button from '@/components/ui/Button';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import Badge from '@/components/ui/Badge';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';
import { RESPONDER_ROLES } from '@/types/role';
import { QUICK_ACTION_CATEGORIES, type QuickActionType } from '@/types/quickActions';
import { useSendMessage } from '@/hooks/chat/useChatMessages';
import { getChatGroupByIncident } from '@/api/chat/chatGroupApi';
import { useToast } from '@/components/toast/ToastProvider';
import { CHAT_QUERY_KEYS } from '@/hooks/queryKeys';

export default function SendCrisisUpdatePage() {
	const { incidentId } = useParams<{ incidentId: string }>();
	const navigate = useNavigate();
	const auth = useAuth();
	const { showSuccess } = useToast();
	const sendMessage = useSendMessage();
	const queryClient = useQueryClient();
	const showSingleError = useSingleErrorToast();

	const id = incidentId ? Number(incidentId) : undefined;
	const { incident, loading, error, fetchIncident } = useIncident(id);

	const [selectedActions, setSelectedActions] = useState<QuickActionType[]>([]);
	const [additionalNotes, setAdditionalNotes] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		showSingleError({
			key: `incident.update.${id ?? 'unknown'}`,
			error,
			loading,
			message: 'Unable to load incident.',
		});
	}, [error, loading, id, showSingleError]);

	const getFilteredCategories = () => {
		return QUICK_ACTION_CATEGORIES;
	};

	const toggleAction = (action: QuickActionType) => {
		setSelectedActions(prev =>
			prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
		);
	};

	const handleSubmit = async () => {
		if (!incident || !auth?.user) return;
		if (selectedActions.length === 0 && !additionalNotes.trim()) {
			alert('Please select at least one quick action or add additional notes.');
			return;
		}

		setIsSubmitting(true);
		try {
			// Get chat group for this incident
			const chatGroup = await getChatGroupByIncident(incident.incidentId);

			if (!chatGroup) {
				alert('No chat group found for this incident.');
				return;
			}

			// Construct the update message
			let updateMessage = '🚨 **Crisis Update**\n\n';

			if (selectedActions.length > 0) {
				updateMessage += '**Quick Actions:**\n';
				selectedActions.forEach(action => {
					updateMessage += `• ${action}\n`;
				});
				updateMessage += '\n';
			}

			if (additionalNotes.trim()) {
				updateMessage += `**Additional Notes:**\n${additionalNotes.trim()}\n\n`;
			}

			updateMessage += `*Update sent by ${auth.user.firstName} ${auth.user.lastName || ''} at ${new Date().toLocaleString()}*`;

			// Send message to chat
			await sendMessage.mutateAsync({
				chatGroupId: chatGroup.id,
				userId: auth.user.userId,
				type: 'LEADER', // Use LEADER type for crisis updates
				content: updateMessage,
			});

			// Manually invalidate messages cache to ensure real-time updates
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.messages.byGroup(chatGroup.id),
			});

			// Show success message and reset form
			showSuccess('Crisis update sent successfully!');
			setSelectedActions([]);
			setAdditionalNotes('');
		} catch {
			alert('Failed to send crisis update. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AuthGuard requireRoles={[...RESPONDER_ROLES]}>
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-5xl mx-auto px-4">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">Send Crisis Update</h1>
						</div>
						<Button variant="outline" onClick={() => navigate(routes.responderDashboard())}>
							Back
						</Button>
					</div>

					{loading && <LoadingPanel text="Loading incident..." className="mb-6" />}

					{error && !loading && (
						<ErrorRetryBlock message="Unable to load incident." onRetry={() => fetchIncident?.()} />
					)}

					{!loading && !error && !incident && (
						<div className="max-w-4xl mx-auto p-8">
							<h2 className="text-2xl font-semibold mb-4">Incident not found</h2>
							<Button variant="outline" onClick={() => navigate(routes.responderDashboard())}>
								Back to Dashboard
							</Button>
						</div>
					)}

					{!loading && !error && incident && (
						<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
							{/* Incident Info Header */}
							<div className="flex items-center justify-between mb-6 pb-4 border-b">
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.title}</h3>
									<p className="text-sm text-gray-600">
										{incident.location} • {incident.status}
									</p>
								</div>
								<div className="flex gap-3 items-center">
									<Badge
										variant={
											incident.severity === 'CRITICAL'
												? 'critical'
												: incident.severity === 'HIGH'
													? 'high'
													: incident.severity === 'MEDIUM'
														? 'medium'
														: 'low'
										}
										className="text-sm"
									>
										Priority: {incident.severity}
									</Badge>
									<Badge variant="default" className="text-sm">
										GRIP: {incident.gripLevel}
									</Badge>
								</div>
							</div>

							{/* Quick Actions Section */}
							<div className="mb-6">
								<h4 className="text-lg font-semibold mb-4">Quick Actions:</h4>

								{/* Quick Action Buttons by Category */}
								<div className="space-y-6">
									{Object.entries(getFilteredCategories()).map(([category, actions]) => (
										<div key={category}>
											<h5 className="text-sm font-semibold text-gray-700 mb-2">{category}</h5>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
												{actions.map(action => (
													<button
														key={action}
														onClick={() => toggleAction(action as QuickActionType)}
														className={`px-3 py-2 text-sm rounded-md border transition-colors text-left ${
															selectedActions.includes(action as QuickActionType)
																? 'bg-blue-100 border-blue-500 text-blue-700'
																: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
														}`}
													>
														• {action}
													</button>
												))}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Additional Notes Section */}
							<div className="mb-6">
								<h4 className="text-lg font-semibold mb-4">Additional Notes:</h4>
								<textarea
									value={additionalNotes}
									onChange={e => setAdditionalNotes(e.target.value)}
									placeholder="Enter additional information about the situation..."
									rows={4}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							{/* Submit Button */}
							<div className="flex justify-end">
								<Button
									variant="primary"
									onClick={handleSubmit}
									disabled={
										isSubmitting || (selectedActions.length === 0 && !additionalNotes.trim())
									}
									className="px-8 py-2"
								>
									{isSubmitting ? 'Sending Update...' : 'Submit Update'}
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</AuthGuard>
	);
}
