import { useEffect } from 'react';
import { FormProvider, type UseFormReturn, type FieldValues } from 'react-hook-form';
import FormFooter from '@/components/forms/base/FormFooter';
import { applyServerValidation } from '@/utils/applyServerValidation';

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
			<form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
				{children}
				{shouldRenderFooter ? <FormFooter {...footerProps} /> : null}
			</form>
		</FormProvider>
	);
}
