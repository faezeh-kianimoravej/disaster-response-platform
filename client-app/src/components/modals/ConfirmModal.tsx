// re-export ConfirmModal from its current location
import { useEffect } from 'react';

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	onConfirm,
	onCancel,
	variant = 'danger',
}: ConfirmModalProps) {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onCancel();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onCancel]);

	const getVariantStyles = () => {
		switch (variant) {
			case 'danger':
				return {
					icon: '⚠️',
					confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
				};
			case 'warning':
				return {
					icon: '⚠️',
					confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
				};
			case 'info':
				return {
					icon: 'ℹ️',
					confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
				};
		}
	};

	if (!isOpen) return null;

	const styles = getVariantStyles();

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="fixed inset-0 backdrop-blur-sm transition-all" onClick={onCancel} />

			<div className="flex min-h-full items-center justify-center p-4">
				<div
					className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-auto transform transition-all border border-gray-200"
					onClick={e => e.stopPropagation()}
				>
					<div className="p-6">
						<div className="flex items-center space-x-3 mb-4">
							<span className="text-2xl">{styles.icon}</span>
							<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
						</div>

						<p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>

						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={onCancel}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
							>
								{cancelText}
							</button>
							<button
								type="button"
								onClick={onConfirm}
								className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.confirmButton}`}
							>
								{confirmText}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
