import { screen, fireEvent } from '@testing-library/react';
import NotificationPanel from '../components/NotificationPanel';
import { AppProviders } from '../context/AppProviders';
import { renderWithRouter } from './utils';
import * as api from '../api/notification';

vi.mock('../api/notification');

const mockNotifications = [
	{
		notificationId: '1',
		read: false,
		createdAt: new Date().toISOString(),
		title: 'Incident 1',
		description: 'Desc 1',
		notificationType: 'NEW_INCIDENT',
	},
	{
		notificationId: '2',
		read: true,
		createdAt: new Date().toISOString(),
		title: 'Incident 2',
		description: 'Desc 2',
		notificationType: 'INCIDENT_UPDATE',
	},
];

describe('NotificationPanel', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		(api.fetchNotifications as jest.Mock).mockResolvedValue(mockNotifications);
		(api.markNotificationAsRead as jest.Mock).mockResolvedValue(undefined);
	});

	function renderPanel() {
		return renderWithRouter(
			<AppProviders>
				<NotificationPanel />
			</AppProviders>
		);
	}

	it('renders bell icon and unread badge', async () => {
		renderPanel();
		const bell = await screen.findByLabelText('Notifications');
		expect(bell).toBeInTheDocument();
		expect(screen.getByText('1')).toBeInTheDocument();
	});

	it('opens panel and displays notifications', async () => {
		renderPanel();
		const bell = await screen.findByLabelText('Notifications');
		fireEvent.click(bell);
		expect(await screen.findByText('Notifications')).toBeInTheDocument();
		expect(screen.getByText('Incident 1')).toBeInTheDocument();
		expect(screen.getByText('Incident 2')).toBeInTheDocument();
	});

	it('marks a notification as read', async () => {
		renderPanel();
		const bell = await screen.findByLabelText('Notifications');
		fireEvent.click(bell);
		const markReadBtn = await screen.findAllByText('Mark As Read');
		expect(markReadBtn[0]).toBeDefined();
		if (markReadBtn[0]) {
			fireEvent.click(markReadBtn[0]);
		}
		expect(api.markNotificationAsRead).toHaveBeenCalledWith('1');
	});
});
