import type { MouseEventHandler, ReactNode } from 'react';

type BaseProps = {
	/** Short message to show (default: 'Unable to load data.') */
	message?: string;
	/** Retry callback */
	onRetry: () => void;
	/** Optional children to render below the message (block variant) */
	children?: ReactNode;
	className?: string;
};

export function ErrorRetryBlock({
	message = 'Unable to load data.',
	onRetry,
	children,
	className = '',
}: BaseProps) {
	return (
		<div className={`text-center py-8 ${className}`.trim()} role="alert" aria-live="polite">
			<p className="text-gray-600 text-lg mb-4">{message}</p>
			<div className="flex items-center justify-center gap-3">
				<button
					onClick={onRetry as MouseEventHandler}
					className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
				>
					Retry
				</button>
				{children}
			</div>
		</div>
	);
}

export function ErrorRetryInline({
	message = 'Unable to load',
	onRetry,
	className = '',
}: Omit<BaseProps, 'children'>) {
	return (
		<button
			onClick={onRetry as MouseEventHandler}
			className={`text-sm text-red-600 underline cursor-pointer focus:ring-2 focus:ring-blue-500 ${className}`.trim()}
			role="button"
			aria-label={`${message}. Retry`}
		>
			{message}
		</button>
	);
}

export default function ErrorRetry(props: BaseProps & { variant?: 'block' | 'inline' }) {
	if (props.variant === 'inline') {
		const { message, onRetry, className } = props;
		return (
			<ErrorRetryInline
				message={message ?? 'Unable to load'}
				onRetry={onRetry}
				className={className ?? ''}
			/>
		);
	}
	return (
		<ErrorRetryBlock
			message={props.message ?? 'Unable to load data.'}
			onRetry={props.onRetry}
			className={props.className ?? ''}
		>
			{props.children}
		</ErrorRetryBlock>
	);
}
