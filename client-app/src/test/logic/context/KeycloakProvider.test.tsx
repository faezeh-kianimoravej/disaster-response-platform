import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock keycloak-js before importing provider
vi.mock('keycloak-js', () => {
	const login = vi.fn().mockResolvedValue(undefined);
	const logout = vi.fn().mockResolvedValue(undefined);
	const init = vi.fn().mockResolvedValue(true);
	const updateToken = vi.fn().mockResolvedValue(true);

	// expose spies for assertions with a typed global field
	(
		globalThis as unknown as {
			__mock_kc?: {
				init: ReturnType<typeof vi.fn>;
				updateToken: ReturnType<typeof vi.fn>;
				login: ReturnType<typeof vi.fn>;
				logout: ReturnType<typeof vi.fn>;
			};
		}
	).__mock_kc = {
		init,
		updateToken,
		login,
		logout,
	};

	class MockKeycloak {
		init!: () => Promise<boolean>;
		updateToken!: () => Promise<boolean>;
		login!: () => Promise<void>;
		logout!: () => Promise<void>;

		token: string | undefined = 'tok-1';
		tokenParsed: { exp: number } = { exp: Math.floor(Date.now() / 1000) + 300 };
		authenticated = true;
		constructor() {
			this.init = init as unknown as () => Promise<boolean>;
			this.updateToken = updateToken as unknown as () => Promise<boolean>;
			this.login = login as unknown as () => Promise<void>;
			this.logout = logout as unknown as () => Promise<void>;
		}
	}

	return { default: MockKeycloak };
});

// Import after mock
import { KeycloakProvider, useKeycloak } from '@/context/KeycloakProvider';

function StatusConsumer() {
	const ctx = useKeycloak();
	return (
		<div>
			<span data-testid="initialized">{String(ctx.initialized)}</span>
			<span data-testid="authenticated">{String(ctx.isAuthenticated)}</span>
		</div>
	);
}

describe('KeycloakProvider', () => {
	beforeEach(() => {
		localStorage.clear();
		sessionStorage.clear();
		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;
		mocks?.init?.mockClear?.();
		mocks?.updateToken?.mockClear?.();
		mocks?.login?.mockClear?.();
		mocks?.logout?.mockClear?.();
	});

	it('initializes and exposes authenticated state and stores token', async () => {
		render(
			<KeycloakProvider>
				<StatusConsumer />
			</KeycloakProvider>
		);

		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;
		await waitFor(() => expect(mocks.init).toHaveBeenCalled());

		await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'));
		expect(screen.getByTestId('authenticated').textContent).toBe('true');

		// token should be stored in localStorage by syncToken
		expect(localStorage.getItem('auth_token')).toBe('tok-1');
	});

	it('login sets session storage and calls keycloak.login', async () => {
		function LoginInvoker() {
			const { login } = useKeycloak();
			return <button data-testid="login-btn" onClick={() => void login()} />;
		}

		render(
			<KeycloakProvider>
				<StatusConsumer />
				<LoginInvoker />
			</KeycloakProvider>
		);

		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;
		await waitFor(() => expect(mocks.init).toHaveBeenCalled());

		fireEvent.click(screen.getByTestId('login-btn'));

		expect(sessionStorage.getItem('kc_login_in_progress')).toBe('1');
		expect(mocks.login).toHaveBeenCalled();
	});

	it('logout removes token and calls keycloak.logout', async () => {
		function LogoutInvoker() {
			const { logout } = useKeycloak();
			return <button data-testid="logout-btn" onClick={() => void logout()} />;
		}

		render(
			<KeycloakProvider>
				<StatusConsumer />
				<LogoutInvoker />
			</KeycloakProvider>
		);

		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;
		await waitFor(() => expect(mocks.init).toHaveBeenCalled());
		// Ensure token present (wait until provider syncs token)
		await waitFor(() => expect(localStorage.getItem('auth_token')).toBe('tok-1'));

		fireEvent.click(screen.getByTestId('logout-btn'));

		expect(localStorage.getItem('auth_token')).toBeNull();
		expect(mocks.logout).toHaveBeenCalled();
	});

	it('init failure sets initialized to true but authenticated to false', async () => {
		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;
		mocks.init?.mockRejectedValueOnce?.(new Error('Keycloak init failed'));

		render(
			<KeycloakProvider>
				<StatusConsumer />
			</KeycloakProvider>
		);

		await waitFor(() => expect(screen.getByTestId('initialized').textContent).toBe('true'));
		expect(screen.getByTestId('authenticated').textContent).toBe('false');
	});

	it('should attempt silent SSO with redirectUri', async () => {
		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;

		render(
			<KeycloakProvider>
				<StatusConsumer />
			</KeycloakProvider>
		);

		await waitFor(() => expect(mocks.init).toHaveBeenCalled());

		// Verify init was called with check-sso onLoad strategy and silent check SSO redirect
		const initCall = mocks.init?.mock.calls?.[0]?.[0] as Record<string, unknown>;
		expect(initCall?.onLoad).toBe('check-sso');
		expect(String(initCall?.silentCheckSsoRedirectUri)).toContain('/silent-check-sso.html');
	});

	it('should clean up kc_login_in_progress on successful init', async () => {
		sessionStorage.setItem('kc_login_in_progress', '1');

		render(
			<KeycloakProvider>
				<StatusConsumer />
			</KeycloakProvider>
		);

		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;
		await waitFor(() => expect(mocks.init).toHaveBeenCalled());

		// Should be cleaned up
		expect(sessionStorage.getItem('kc_login_in_progress')).toBeNull();
	});

	it('should provide keycloak instance through context', async () => {
		function KeycloakConsumer() {
			const { keycloak } = useKeycloak();
			return <div data-testid="token-display">{keycloak?.token}</div>;
		}

		render(
			<KeycloakProvider>
				<KeycloakConsumer />
			</KeycloakProvider>
		);

		const mocks = (
			globalThis as unknown as { __mock_kc?: Record<string, ReturnType<typeof vi.fn>> }
		).__mock_kc!;
		await waitFor(() => expect(mocks.init).toHaveBeenCalled());

		await waitFor(() => expect(screen.getByTestId('token-display').textContent).toBe('tok-1'));
	});
});
