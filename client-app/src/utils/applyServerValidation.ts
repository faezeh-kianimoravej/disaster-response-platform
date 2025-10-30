import type { FieldError, UseFormSetError } from 'react-hook-form';

export function applyServerValidation<T extends Record<string, unknown>>(
	setError: UseFormSetError<T>,
	validation: Record<string, string> | null
) {
	if (!validation) return;
	for (const key of Object.keys(validation)) {
		const msg = validation[key];
		if (msg) setError(key as any, { type: 'server', message: msg } as Partial<FieldError>);
	}
}
