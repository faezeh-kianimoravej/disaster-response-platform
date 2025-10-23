import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NOTIFICATION_UI_MAP } from '@/types/notification-ui-map';
import {
	Bell,
	X,
	AlertCircle,
	CheckCircle2,
	Info,
	Megaphone,
	Truck,
	CloudSun,
	BellRing,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return 'just now';
	if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
	if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
	if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
	return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export default function NotificationPanel() {
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

	const [soundEnabled, setSoundEnabled] = useState(true);
	const panelRef = useRef<HTMLDivElement>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const prevNotificationsLength = useRef<number>(0);
	const { notifications, unreadCount, markAsRead, markAllAsRead, loading, error } =
		useNotifications();
	console.log('Notifications:', notifications);
	// Play sound when a new notification arrives
	useEffect(() => {
		if (soundEnabled && notifications.length > prevNotificationsLength.current) {
			if (audioRef.current) {
				audioRef.current.currentTime = 0;
				audioRef.current.play();
			}
		}
		prevNotificationsLength.current = notifications.length;
	}, [notifications, soundEnabled]);

	// Close panel when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
		return undefined;
	}, [isOpen]);

	const filteredNotifications =
		activeTab === 'unread' ? notifications.filter(n => !n.read) : notifications;

	const groupedNotifications = filteredNotifications.reduce(
		(groups, notification) => {
			const date = new Date(notification.createdAt);
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			let key = 'Older';
			if (date.toDateString() === today.toDateString()) {
				key = 'Today';
			} else if (date.toDateString() === yesterday.toDateString()) {
				key = 'Yesterday';
			} else {
				key = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
			}

			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key]!.push(notification);
			return groups;
		},
		{} as Record<string, typeof notifications>
	);

	return (
		<div className="relative" ref={panelRef}>
			{/* Notification sound audio element */}
			<audio ref={audioRef} preload="auto" style={{ display: 'none' }}>
				<source src="/audio/notification.ogg" type="audio/ogg" />
			</audio>{' '}
			{/* Bell Icon Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-white hover:text-blue-200 transition-colors"
				aria-label="Notifications"
			>
				<Bell size={24} />
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</button>
			{/* Notification Panel */}
			{isOpen && (
				<div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
						<button
							onClick={() => setIsOpen(false)}
							className="text-gray-400 hover:text-gray-600"
							aria-label="Close"
						>
							<X size={20} />
						</button>
					</div>

					{/* Tabs */}
					<div className="flex border-b border-gray-200">
						<button
							onClick={() => setActiveTab('all')}
							className={`flex-1 px-4 py-3 text-sm font-medium ${
								activeTab === 'all'
									? 'text-blue-600 border-b-2 border-blue-600'
									: 'text-gray-600 hover:text-gray-900'
							}`}
						>
							All
						</button>
						<button
							onClick={() => setActiveTab('unread')}
							className={`flex-1 px-4 py-3 text-sm font-medium ${
								activeTab === 'unread'
									? 'text-blue-600 border-b-2 border-blue-600'
									: 'text-gray-600 hover:text-gray-900'
							}`}
						>
							Unread ({unreadCount})
						</button>
					</div>

					{/* Notifications List */}
					<div className="max-h-96 overflow-y-auto">
						{loading ? (
							<div className="p-8 text-center text-gray-500">
								<p>Loading notifications...</p>
							</div>
						) : error ? (
							<div className="p-8 text-center text-red-500">
								<p>{error}</p>
							</div>
						) : filteredNotifications.length === 0 ? (
							<div className="p-8 text-center text-gray-500">
								<p>No notifications</p>
							</div>
						) : (
							Object.entries(groupedNotifications).map(([date, items]) => (
								<div key={date}>
									<div className="px-4 py-2 bg-gray-50">
										<h3 className="text-xs font-semibold text-gray-600 uppercase">{date}</h3>
									</div>
									{items.map(notification => {
										const config = NOTIFICATION_UI_MAP[notification.notificationType];
										const url = config?.actionUrl?.(notification);
										// Map icon string to Lucide icon component
										const iconMap: Record<string, JSX.Element> = {
											report: <AlertCircle size={16} className="text-gray-600" />,
											notifications: <BellRing size={16} className="text-gray-600" />,
											info: <Info size={16} className="text-gray-600" />,
											resolved: <CheckCircle2 size={16} className="text-gray-600" />,
											megaphone: <Megaphone size={16} className="text-gray-600" />,
											truck: <Truck size={16} className="text-gray-600" />,
											weather: <CloudSun size={16} className="text-gray-600" />,
										};
										const icon = iconMap[config?.icon || 'notifications'] || (
											<Bell size={16} className="text-gray-600" />
										);
										return (
											<div
												key={notification.notificationId}
												className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''} ${url ? 'cursor-pointer' : ''}`}
												onClick={() => {
													if (!notification.read) {
														markAsRead(notification.notificationId);
													}
													if (url) {
														setIsOpen(false);
														navigate(url);
													}
												}}
											>
												<div className="flex items-start gap-3">
													{/* Unread indicator */}
													{!notification.read && (
														<div className="mt-2 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
													)}
													{/* Icon placeholder */}
													<div className="mt-1 w-8 h-8 flex-shrink-0 flex items-center justify-center">
														{icon}
													</div>
													{/* Content */}
													<div className="flex-1 min-w-0">
														<h4 className="text-sm font-semibold text-gray-900">
															{notification.title}
														</h4>
														<p className="text-sm text-gray-600 mt-1">{notification.description}</p>
														<p className="text-xs text-gray-400 mt-1">
															{formatTimeAgo(notification.createdAt)}
														</p>
														{/* Action Buttons */}
														<div className="flex gap-2 mt-2">
															{!notification.read && (
																<button
																	onClick={e => {
																		e.stopPropagation();
																		markAsRead(notification.notificationId);
																	}}
																	className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
																>
																	Mark As Read
																</button>
															)}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							))
						)}
					</div>

					{/* Footer */}
					{filteredNotifications.length > 0 && (
						<div className="flex items-center justify-between p-4 border-t border-gray-200 gap-2">
							<div className="flex items-center gap-2">
								<button
									onClick={() => setSoundEnabled(prev => !prev)}
									className={`text-sm ${soundEnabled ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-800`}
									aria-label={
										soundEnabled ? 'Disable notification sound' : 'Enable notification sound'
									}
								>
									{soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
								</button>
							</div>
							<button
								onClick={markAllAsRead}
								className="text-sm font-medium text-blue-600 hover:text-blue-800"
							>
								Mark All As Read
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
