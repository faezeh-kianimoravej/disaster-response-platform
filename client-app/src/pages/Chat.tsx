import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routes } from '@/routes';
import ChatWindow from '@/components/features/chat/ChatWindow';
import { useChatGroups } from '@/hooks/chat/useChatGroups';
import { formatRelativeTime } from '@/utils/time';
import { useCurrentUserId } from '@/context/AuthContext';
import LoadingPanel from '@/components/ui/LoadingPanel';
import { ErrorRetryBlock } from '@/components/ui/ErrorRetry';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ChatPage() {
	return (
		<AuthGuard>
			<ChatPageContent />
		</AuthGuard>
	);
}

function ChatPageContent() {
	const navigate = useNavigate();
	const params = useParams<{ chatId?: string }>();
	const currentUserId = useCurrentUserId();

	const {
		data: chatGroups = [],
		isLoading: isLoadingGroups,
		error: groupsError,
	} = useChatGroups(currentUserId);

	const initialFromParam = params.chatId ? Number(params.chatId) : undefined;
	const [selected, setSelected] = useState<number | undefined>(initialFromParam);

	// keep selected in sync with URL param
	useEffect(() => {
		if (params.chatId) {
			const id = Number(params.chatId);
			if (!Number.isNaN(id)) {
				setSelected(id);
			}
		}
	}, [params.chatId]);

	// pick first chat when list loads and none selected
	useEffect(() => {
		if (selected === undefined && chatGroups.length > 0) {
			const firstId = chatGroups[0]?.id;
			if (firstId !== undefined) setSelected(firstId);
		}
	}, [chatGroups, selected]);

	const chatSummaries = useMemo(() => {
		const list = chatGroups.map(c => {
			const lastActivityDate = c.updatedAt ?? c.createdAt;
			const lastActivity = lastActivityDate?.getTime() ?? 0;
			const lastMsgIso = lastActivityDate?.toISOString() ?? '';

			return {
				...c,
				lastActivity,
				lastMsgText: 'No messages yet...',
				lastMsgIso,
				draft: '',
				unreadCount: 0,
			};
		});

		return list.sort((a, b) => b.lastActivity - a.lastActivity);
	}, [chatGroups]);

	const selectedName = chatGroups.find(x => x.id === selected)?.name ?? 'Chat';

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="mb-6">
					<h1 className="text-2xl font-bold">Chat</h1>
				</div>

				{isLoadingGroups ? (
					<LoadingPanel text="Loading chat groups..." className="h-96" />
				) : groupsError ? (
					<ErrorRetryBlock
						message={`Error loading chat groups: ${groupsError?.message || 'Unknown error'}`}
						onRetry={() => window.location.reload()}
					/>
				) : (
					<div className="w-full bg-white rounded-lg shadow-lg flex min-w-0">
						{/* Left: chat list */}
						<aside className="w-72 flex-none bg-gray-50 overflow-auto relative z-40 border-r border-gray-100 sticky top-0 h-screen">
							<div className="flex flex-col gap-1 p-1">
								{chatSummaries.length === 0 ? (
									<div className="p-4 text-center">
										<div className="text-gray-500 mb-2">No chat groups available</div>
										<div className="text-xs text-gray-400">No groups found</div>
									</div>
								) : (
									chatSummaries.map(c => (
										<button
											key={c.id}
											className={`w-full text-left px-3 py-3 hover:bg-slate-50 focus:outline-none rounded-r overflow-hidden relative ${
												selected === c.id ? 'bg-white font-semibold shadow-sm' : ''
											}`}
											onClick={() => {
												setSelected(c.id);
												navigate(routes.chatWith(c.id));
											}}
											aria-current={selected === c.id ? 'true' : undefined}
										>
											<div className="grid grid-cols-[1fr_72px] gap-3 items-center">
												<div className="min-w-0 flex items-start gap-3">
													{selected === c.id ? (
														<span className="w-1.5 h-6 bg-sky-600 rounded mr-2 mt-1" aria-hidden />
													) : (
														<span className="w-1.5 h-6 mr-2 mt-1" aria-hidden />
													)}
													<div className="min-w-0">
														<div className="font-medium truncate">{c.name}</div>
														<div className="text-sm text-gray-500 truncate mt-0.5">
															{c.draft ? (
																<span className="text-red-600 font-medium">concept:</span>
															) : null}
															<span className={`ml-1 ${c.draft ? 'text-gray-600' : ''} truncate`}>
																{c.draft ? c.draft : c.lastMsgText}
															</span>
														</div>
													</div>
												</div>
												<div className="flex flex-col items-end justify-center text-right">
													<div className="text-xs text-gray-400 whitespace-nowrap">
														{formatRelativeTime(c.lastMsgIso)}
													</div>
													{c.unreadCount > 0 ? (
														<div className="inline-flex flex-shrink-0 items-center justify-center px-2 py-0.5 text-xs rounded-full bg-red-600 text-white mt-1">
															{c.unreadCount}
														</div>
													) : (
														<div className="h-4" />
													)}
												</div>
											</div>
										</button>
									))
								)}
							</div>
						</aside>

						{/* Right: chat window */}
						<div className="flex-1 flex flex-col relative z-0 min-w-0">
							{!selected ? (
								<div className="flex-1 flex items-center justify-center">
									<div className="text-center">
										<div className="text-xl text-gray-400 mb-4">💬</div>
										<p className="text-sm text-gray-500">Select a chat group to begin</p>
									</div>
								</div>
							) : (
								<>
									<div className="px-6 py-4 border-b border-gray-100">
										<h2 className="text-lg font-semibold">{selectedName}</h2>
									</div>
									<div className="p-6">
										<ChatWindow
											chatGroupId={selected!}
											currentUserId={currentUserId ?? undefined}
										/>
									</div>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
