import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import RHFImageInput from '@/components/forms/rhf/RHFImageInput';

type F = { image: string };

function ImageForm() {
	const methods = useForm<F>({ defaultValues: { image: 'data:image/png;base64,xxx' } });
	return (
		<FormProvider {...methods}>
			<RHFImageInput<F> name={'image'} label="Image" />
		</FormProvider>
	);
}

describe('RHFImageInput smoke', () => {
	it('renders with preview from default value', () => {
		render(<ImageForm />);
		const img = screen.getByAltText('Preview') as HTMLImageElement;
		expect(img).toBeInTheDocument();
		expect(img.src).toContain('data:image/png;base64');
	});
});
