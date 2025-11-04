import { describe, it, expect, vi } from 'vitest';
import { useEffect } from 'react';
import { render } from '@testing-library/react';
import useSingleErrorToast from '@/hooks/useSingleErrorToast';

const showError = vi.fn();
vi.mock('@/components/toast/ToastProvider', () => ({
	useToast: () => ({ showError }),
}));

function Harness({ error, loading }: { error: unknown; loading?: boolean }) {
	const single = useSingleErrorToast();
	useEffect(() => {
		single({ key: 'k', error, loading: loading ?? false, message: 'Oops' });
	}, [error, loading, single]);
	return <div>ok</div>;
}

describe('useSingleErrorToast', () => {
	it('shows once for same error and resets when cleared', () => {
		const { rerender } = render(<Harness error={new Error('x')} />);
		expect(showError).toHaveBeenCalledTimes(1);

		// same error again -> no new toast
		rerender(<Harness error={new Error('x')} />);
		expect(showError).toHaveBeenCalledTimes(1);

		// clear error -> resets
		rerender(<Harness error={null} loading={false} />);

		// error again -> shows again
		rerender(<Harness error={new Error('x')} />);
		expect(showError).toHaveBeenCalledTimes(2);
	});
});
