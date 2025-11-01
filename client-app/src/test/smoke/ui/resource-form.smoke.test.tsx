import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';

vi.mock('@/hooks/useResource', () => ({
	useCreateResource: () => ({ mutateAsync: vi.fn() }),
	useUpdateResource: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/components/forms/rhf/RHFImageInput', () => ({
	default: (props: { label?: string }) => <input aria-label={props.label ?? 'Custom Image'} />,
}));

import ResourceForm from '@/components/forms/ResourceForm';

describe('ResourceForm smoke', () => {
	it('renders with default fields (create)', () => {
		renderWithProviders(<ResourceForm isNewResource departmentId={1} onCancel={() => {}} />, {
			route: '/resources',
		});
		expect(screen.getByText(/create new resource/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
	});
});
