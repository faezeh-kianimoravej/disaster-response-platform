import type { FieldError, UseFormSetError, Path } from 'react-hook-form';

export function applyServerValidation<T extends Record<string, unknown>>(
	setError: UseFormSetError<T>,
	validation: Record<string, string> | null
) {
	if (!validation) return;
	for (const key of Object.keys(validation) as Array<keyof T & string>) {
		const msg = validation[key];
		if (msg) {
			const errorObj: FieldError = { type: 'server', message: msg };
			setError(key as Path<T>, errorObj);
		}
	}
}
