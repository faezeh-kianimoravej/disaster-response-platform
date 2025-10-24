import { render, screen, act } from '@testing-library/react';
import { NotificationProvider, useNotificationContext } from '../context/NotificationContext';

const TestComponent = () => {
	const { lastNotificationId, setLastNotificationId } = useNotificationContext();
	return (
		<div>
			<span data-testid="last-id">{lastNotificationId === null ? 'none' : lastNotificationId}</span>
			<button onClick={() => setLastNotificationId(123)}>Set ID</button>
		</div>
	);
};

describe('NotificationContext', () => {
	it('provides and updates lastNotificationId', () => {
		render(
			<NotificationProvider>
				<TestComponent />
			</NotificationProvider>
		);
		expect(screen.getByTestId('last-id').textContent).toBe('none');
		act(() => {
			screen.getByText('Set ID').click();
		});
		expect(screen.getByTestId('last-id').textContent).toBe('123');
	});
});
