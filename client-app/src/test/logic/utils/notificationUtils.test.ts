import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showBrowserNotification } from '@/utils/notificationUtils';

type ClickHandler = ((e: { preventDefault: () => void }) => void) | null;

interface NotificationInstance {
	onclick: ClickHandler;
}

interface NotificationStatic {
	new (title: string, options?: NotificationOptions): NotificationInstance;
	permission: 'granted' | 'denied' | 'default';
}

describe('notificationUtils.showBrowserNotification', () => {
	let created: {
		title: string;
		options: NotificationOptions | undefined;
		instance: NotificationInstance;
	}[];
	let OriginalNotification: unknown;
	let focusSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		created = [];
		OriginalNotification = (globalThis as unknown as { Notification?: unknown }).Notification;
		focusSpy = vi.fn();
		(globalThis as unknown as { focus: () => void }).focus = focusSpy;
	});

	afterEach(() => {
		(globalThis as unknown as { Notification?: unknown }).Notification = OriginalNotification;
		vi.restoreAllMocks();
	});

	function installMock(permission: 'granted' | 'denied' | 'default') {
		const Mock: NotificationStatic = class MockNotification implements NotificationInstance {
			static permission = permission;
			onclick: ClickHandler = null;
			constructor(
				public title: string,
				public options?: NotificationOptions
			) {
				created.push({ title, options, instance: this });
			}
		} as unknown as NotificationStatic;
		(globalThis as unknown as { Notification: NotificationStatic }).Notification = Mock;
	}

	it('creates notification when permission granted and sets icon/onclick', () => {
		installMock('granted');
		const prevent = vi.fn();

		showBrowserNotification('Hello', { body: 'World' });

		expect(created).toHaveLength(1);
		expect(created[0]!.title).toBe('Hello');
		expect(created[0]!.options?.icon).toBe('/favicon.jpg');

		// Simulate click
		const inst = created[0]!.instance;
		expect(typeof inst.onclick).toBe('function');
		if (inst.onclick) inst.onclick({ preventDefault: prevent });

		expect(prevent).toHaveBeenCalled();
		// In jsdom, window.parent === window, so focus may be called twice
		expect(focusSpy).toHaveBeenCalledTimes(2);
	});

	it('does nothing when permission is denied', () => {
		installMock('denied');
		showBrowserNotification('Nope');
		expect(created).toHaveLength(0);
	});

	it('uses provided options but overrides icon', () => {
		installMock('granted');
		showBrowserNotification('Title', { body: 'B', icon: '/custom.png' });
		expect(created).toHaveLength(1);
		expect(created[0]!.options?.body).toBe('B');
		expect(created[0]!.options?.icon).toBe('/favicon.jpg');
	});
});
