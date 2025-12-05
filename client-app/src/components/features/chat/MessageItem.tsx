import type { Message } from '@/types/chat';

interface Props {
	msg: Message;
	isOwn?: boolean | undefined;
	showAvatar?: boolean | undefined;
	showTime?: boolean | undefined;
	isFocused?: boolean | undefined;
	'data-msg-id'?: string | undefined;
}

export default function MessageItem(props: Props) {
	const { msg, isOwn, showAvatar = true, showTime = true, isFocused = false } = props;

	const base = 'rounded-md p-3 text-slate-900 bg-white shadow-sm';
	const isSystem = msg.type === 'SYSTEM';
	const isLeader = msg.type === 'LEADER';
	const maxWidth = isSystem ? 'max-w-full' : 'max-w-[42ch]';

	const variant = isSystem
		? 'bg-indigo-50 border-l-4 border-indigo-500'
		: isLeader
			? 'bg-gradient-to-r from-orange-50 to-pink-50 border border-amber-300'
			: 'bg-white';

	const ownAccent = isOwn ? 'border border-sky-100 shadow-md bg-sky-50' : '';
	const messageBackground = isOwn ? ownAccent : variant;

	const initials = msg.userFullName
		? msg.userFullName
				.split(' ')
				.map(n => n[0])
				.join('')
				.toUpperCase()
		: 'AN';

	const timeStr = new Date(msg.timestamp).toLocaleTimeString(undefined, {
		hour: '2-digit',
		minute: '2-digit',
	});

	if (isSystem) {
		return (
			<div role="article" aria-label={`System: ${msg.content}`} className="w-full">
				<div className={`w-full ${variant} rounded-sm px-4 py-3 text-sm text-indigo-900`}>
					{msg.content}
				</div>
				{showTime ? <div className="text-right text-xs text-slate-400 mt-1">{timeStr}</div> : null}
			</div>
		);
	}

	return (
		<div
			className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'}`}
			role="article"
			aria-label={`${msg.userFullName ?? 'System'}: ${msg.content}`}
			tabIndex={0}
		>
			<div
				className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${maxWidth}`}
			>
				{/* Avatar */}
				{showAvatar ? (
					<div className="flex-shrink-0">
						<div
							className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium text-white ${
								isOwn ? 'bg-sky-500' : 'bg-slate-400'
							}`}
							aria-hidden
						>
							{initials}
						</div>
					</div>
				) : (
					<div className="w-9" />
				)}

				<div
					className={`${base} ${messageBackground} relative min-w-[8rem] ${isFocused ? 'ring-2 ring-sky-200' : ''}`}
					aria-live="polite"
					data-msg-id={msg.chatMessageId}
				>
					{showAvatar && msg.userFullName && (
						<div className="font-semibold">{msg.userFullName}</div>
					)}
					<div className="whitespace-pre-wrap break-words">{msg.content}</div>

					{/* Time at bottom-right without seconds; only show for last message in a group */}
					{showTime ? (
						<div className="flex justify-end">
							<span className="text-xs text-slate-400 ml-2">{timeStr}</span>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
