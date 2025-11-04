import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingPanel from '@/components/ui/LoadingPanel';
import ErrorRetry, { ErrorRetryBlock, ErrorRetryInline } from '@/components/ui/ErrorRetry';
import Logo from '@/components/ui/Logo';

describe('UI atoms smoke', () => {
	it('renders Button', () => {
		renderWithProviders(<Button>Click me</Button>);
		expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
	});

	it('renders Badge', () => {
		renderWithProviders(<Badge>Badge</Badge>);
		expect(screen.getByText(/badge/i)).toBeInTheDocument();
	});

	it('renders LoadingPanel', () => {
		renderWithProviders(<LoadingPanel text="Loading" />);
		expect(screen.getByText(/loading/i)).toBeInTheDocument();
	});

	it('renders ErrorRetry (block + inline)', () => {
		const onRetry = vi.fn();
		renderWithProviders(
			<div>
				<ErrorRetryBlock onRetry={onRetry} />
				<ErrorRetryInline onRetry={onRetry} />
				<ErrorRetry onRetry={onRetry} />
				<ErrorRetry variant="inline" onRetry={onRetry} />
			</div>
		);
		expect(screen.getAllByText(/unable to load/i).length).toBeGreaterThan(0);
	});

	it('renders Logo with and without text', () => {
		renderWithProviders(
			<div>
				<Logo />
				<Logo withText />
			</div>
		);
		expect(screen.getByAltText(/drccs icon/i)).toBeInTheDocument();
		expect(screen.getByAltText(/drccs logo/i)).toBeInTheDocument();
	});
});
