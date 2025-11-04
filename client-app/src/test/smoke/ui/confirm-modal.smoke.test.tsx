import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ConfirmModal from '@/components/ui/ConfirmModal';

describe('ConfirmModal smoke', () => {
	it('renders when open and triggers confirm/cancel', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		render(
			<ConfirmModal
				isOpen
				title="Delete resource"
				message="Are you sure?"
				confirmText="Yes, delete"
				cancelText="No"
				onConfirm={onConfirm}
				onCancel={onCancel}
				variant="danger"
			/>
		);

		expect(screen.getByText(/delete resource/i)).toBeInTheDocument();
		expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

		fireEvent.click(screen.getByText(/no/i));
		expect(onCancel).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByText(/yes, delete/i));
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it('closes on escape', () => {
		const onCancel = vi.fn();
		render(
			<ConfirmModal
				isOpen
				title="Title"
				message="Message"
				onConfirm={() => {}}
				onCancel={onCancel}
			/>
		);

		fireEvent.keyDown(document, { key: 'Escape' });
		expect(onCancel).toHaveBeenCalled();
	});
});
