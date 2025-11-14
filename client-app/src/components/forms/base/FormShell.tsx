import { useEffect } from 'react';
import {
	FormProvider,
	type UseFormReturn,
	type FieldValues,
	type FieldErrors,
} from 'react-hook-form';
import FormFooter from '@/components/forms/base/FormFooter';
import { applyServerValidation } from '@/utils/applyServerValidation';
import { useToast } from '@/components/toast/ToastProvider';

type FooterProps = { onCancel?: (() => void) | undefined; disabled?: boolean | undefined };

type FormShellProps<TFormValues extends FieldValues> = {
	methods: UseFormReturn<TFormValues>;
	onSubmit: (values: TFormValues) => Promise<unknown> | unknown;
	serverValidation?: Record<string, string> | null;
	footer?: boolean | FooterProps;
	className?: string;
	children?: React.ReactNode;
};

export default function FormShell<TFormValues extends FieldValues>({
	methods,
	onSubmit,
	serverValidation,
	footer = true,
	className,
	children,
}: FormShellProps<TFormValues>) {
	const { showError } = useToast();
	useEffect(() => {
		if (serverValidation) applyServerValidation(methods.setError, serverValidation);
	}, [serverValidation, methods]);

	const shouldRenderFooter = footer !== false;
	const isSubmitting = methods.formState?.isSubmitting ?? false;
	const footerProps: FooterProps =
		typeof footer === 'object' && footer
			? {
					...(footer as FooterProps),
					disabled: ((footer as FooterProps).disabled ?? false) || isSubmitting,
				}
			: { disabled: isSubmitting };

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={methods.handleSubmit(
					async (values: TFormValues) => {
						await onSubmit(values as TFormValues);
					},
					(errors: FieldErrors<TFormValues>) => {
						try {
							const keys = Object.keys(errors || {});
							const firstKey = keys.length > 0 ? keys[0] : undefined;
							const firstMessage = firstKey
								? (((errors as Record<string, unknown>)[firstKey] as { message?: string })
										?.message ?? 'Validation failed')
								: 'Validation failed';
							// Only show a toast for validation failures when there are no field-level errors.
							// Field-level errors are rendered inline by form controls and should not duplicate
							// in a toast (tests expect a single inline message).
							if (!keys || keys.length === 0) {
								try {
									showError(firstMessage);
								} catch {}
							}

							if (
								firstKey &&
								typeof (methods as unknown as { setFocus?: (name: string) => void }).setFocus ===
									'function'
							) {
								(methods as unknown as { setFocus?: (name: string) => void }).setFocus!(firstKey);
							}
						} catch {}
					}
				)}
				className={className}
			>
				{children}
				{shouldRenderFooter ? <FormFooter {...footerProps} /> : null}
			</form>
		</FormProvider>
	);
}
