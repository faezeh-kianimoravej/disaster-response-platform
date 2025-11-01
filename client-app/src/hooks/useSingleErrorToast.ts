import { useCallback, useRef } from 'react';
import { useToast } from '@/components/toast/ToastProvider';

type Params = {
	key?: string;
	error?: unknown;
	loading?: boolean;
	message?: string;
};

/**
 * Hook to show an error toast only once per logical key while an error persists.
 * Call the returned function from an effect with the current error/loading state.
 */
export function useSingleErrorToast() {
	const { showError } = useToast();
	const shownRef = useRef<Record<string, boolean>>({});

	const showSingle = useCallback(
		({ key, error, loading, message }: Params) => {
			const k = key ?? (typeof message === 'string' ? message : String(error ?? 'unknown'));

			if (error && !shownRef.current[k]) {
				const text =
					typeof message === 'string'
						? message
						: typeof error === 'string'
							? error
							: 'An unexpected error occurred.';
				showError(text as string);
				shownRef.current[k] = true;
			} else if (!error && !loading) {
				shownRef.current[k] = false;
			}
		},
		[showError]
	);

	return showSingle;
}

export default useSingleErrorToast;
