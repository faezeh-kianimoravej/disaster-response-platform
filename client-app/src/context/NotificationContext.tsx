import { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
	lastNotificationId: number | null;
	setLastNotificationId: (id: number | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const [lastNotificationId, setLastNotificationId] = useState<number | null>(null);

	return (
		<NotificationContext.Provider value={{ lastNotificationId, setLastNotificationId }}>
			{children}
		</NotificationContext.Provider>
	);
};

export function useNotificationContext() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotificationContext must be used within a NotificationProvider');
	}
	return context;
}
