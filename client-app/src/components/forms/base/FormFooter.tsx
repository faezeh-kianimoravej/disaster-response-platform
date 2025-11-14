import Button from '@/components/ui/Button';

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
				onClick={() => {}}
				aria-label="Save"
			>
				{disabled ? (
					<>
						<svg
							className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							/>
						</svg>
						Save
					</>
				) : (
					'Save'
				)}
			</Button>
			<Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
				Cancel
			</Button>
		</div>
	);
}
