import { useEffect, useState } from 'react';

export interface ToastProps {
	message: string;
	type?: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
	onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
	const [isVisible, setIsVisible] = useState(true);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		// Start enter animation
		setIsAnimating(true);

		// Auto-dismiss after duration
		const timer = setTimeout(() => {
			handleClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration]);

	const handleClose = () => {
		setIsAnimating(false);
		// Wait for exit animation before removing
		setTimeout(() => {
			setIsVisible(false);
			onClose?.();
		}, 300);
	};

	if (!isVisible) {
		return null;
	}

	const getTypeStyles = () => {
		switch (type) {
			case 'success':
				return 'bg-green-50 border-green-200 text-green-800';
			case 'error':
				return 'bg-red-50 border-red-200 text-red-800';
			case 'warning':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800';
			default:
				return 'bg-blue-50 border-blue-200 text-blue-800';
		}
	};

	const getIcon = () => {
		switch (type) {
			case 'success':
				return '✓';
			case 'error':
				return '✕';
			case 'warning':
				return '⚠';
			default:
				return 'ℹ';
		}
	};

	return (
		<div
			className={`relative w-80 border rounded-lg shadow-lg p-4 transition-all duration-300 ${
				isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
			} ${getTypeStyles()}`}
		>
			<div className="flex items-start justify-between">
				<div className="flex items-start space-x-3 flex-1 min-w-0">
					<span className="text-lg font-semibold flex-shrink-0">{getIcon()}</span>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium whitespace-pre-line break-words">{message}</p>
					</div>
				</div>
				<button
					onClick={handleClose}
					className="ml-3 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
					aria-label="Close notification"
				>
					<span className="text-lg">×</span>
				</button>
			</div>
		</div>
	);
}
