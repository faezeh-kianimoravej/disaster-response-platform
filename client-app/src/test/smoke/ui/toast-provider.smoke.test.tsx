import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/toast/ToastProvider';

function Demo() {
	const { showSuccess } = useToast();
	return <button onClick={() => showSuccess('Saved!')}>Trigger</button>;
}

describe('ToastProvider smoke', () => {
	it('shows toast on demand', () => {
		render(
			<ToastProvider>
				<Demo />
			</ToastProvider>
		);
		fireEvent.click(screen.getByText(/trigger/i));
		expect(screen.getByText(/saved!/i)).toBeInTheDocument();
	});
});
