import Button from './Button';

export default function FormFooter({
	onCancel,
	disabled,
}: {
	onCancel?: (() => void) | undefined;
	disabled?: boolean | undefined;
}) {
	return (
		<div className="mt-6 flex justify-end space-x-4">
			<Button
				type="submit"
				variant={disabled ? 'disabled' : 'success'}
				className="px-4"
				disabled={disabled}
			>
				Save
			</Button>
			<Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
				Cancel
			</Button>
		</div>
	);
}
