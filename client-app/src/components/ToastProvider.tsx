import { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastMessage extends Omit<ToastProps, 'onClose'> {
	id: string;
}

interface ToastContextType {
	showToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
	showError: (message: string) => void;
	showSuccess: (message: string) => void;
	showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within a ToastProvider');
	}
	return context;
}

interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const showToast = (message: string, type: ToastProps['type'] = 'info', duration = 5000) => {
		const id = Date.now().toString();
		const newToast: ToastMessage = {
			id,
			message,
			type,
			duration,
		};

		setToasts(prev => [...prev, newToast]);
	};

	const removeToast = (id: string) => {
		setToasts(prev => prev.filter(toast => toast.id !== id));
	};

	const showError = (message: string) => showToast(message, 'error', 7000);
	const showSuccess = (message: string) => showToast(message, 'success', 4000);
	const showWarning = (message: string) => showToast(message, 'warning', 6000);

	const value = {
		showToast,
		showError,
		showSuccess,
		showWarning,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="fixed top-4 right-4 z-50 space-y-3">
				{toasts.map((toast, index) => (
					<div
						key={toast.id}
						style={{
							transform: `translateY(${index * 4}px) scale(${1 - index * 0.05})`,
							zIndex: 50 - index,
						}}
					>
						<Toast
							message={toast.message}
							type={toast.type ?? 'info'}
							duration={toast.duration ?? 5000}
							onClose={() => removeToast(toast.id)}
						/>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}
