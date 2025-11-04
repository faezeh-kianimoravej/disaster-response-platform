import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useLogin } from '@/hooks/useLogin';
import * as userApi from '@/api/user';
import { useAuth } from '@/context/AuthContext';
import type { AuthContextValue } from '@/context/AuthContext';

vi.mock('@/api/user');
vi.mock('@/context/AuthContext');

describe('useLogin', () => {
	const mockSetAuth = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();

		vi.mocked(useAuth).mockReturnValue({
			isLoggedIn: false,
			user: null,
			token: undefined,
			setAuth: mockSetAuth,
		} as AuthContextValue);
	});

	it('should successfully login with valid credentials', async () => {
		const mockLoginResponse = {
			token: 'test-token',
			email: 'test@example.com',
			roles: [
				{
					roleType: 'Region Admin' as const,
					regionId: 1,
					municipalityId: null,
					departmentId: null,
				},
			],
		};

		vi.mocked(userApi.login).mockResolvedValueOnce(mockLoginResponse);

		const { result } = renderHook(() => useLogin());

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBeNull();

		let success: boolean = false;
		await act(async () => {
			success = await result.current.login('test@example.com', 'password123');
		});

		await waitFor(() => {
			expect(success).toBe(true);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBeNull();
		});

		expect(localStorage.getItem('auth_token')).toBe('test-token');
		expect(localStorage.getItem('user_email')).toBe('test@example.com');

		expect(mockSetAuth).toHaveBeenCalledWith({
			isLoggedIn: true,
			user: expect.objectContaining({
				email: 'test@example.com',
				roles: mockLoginResponse.roles,
			}),
			token: 'test-token',
		});
	});

	it('should handle login failure', async () => {
		const mockError = {
			message: 'Invalid credentials',
		};

		vi.mocked(userApi.login).mockRejectedValueOnce(mockError);

		const { result } = renderHook(() => useLogin());

		let success: boolean = true;
		await act(async () => {
			success = await result.current.login('test@example.com', 'wrongpassword');
		});

		await waitFor(() => {
			expect(success).toBe(false);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe('Invalid credentials');
		});

		expect(localStorage.getItem('auth_token')).toBeNull();
		expect(mockSetAuth).not.toHaveBeenCalled();
	});

	it('should logout and clear localStorage', () => {
		localStorage.setItem('auth_token', 'test-token');
		localStorage.setItem('user_email', 'test@example.com');

		const { result } = renderHook(() => useLogin());

		act(() => {
			result.current.logout();
		});

		expect(localStorage.getItem('auth_token')).toBeNull();
		expect(localStorage.getItem('user_email')).toBeNull();

		expect(mockSetAuth).toHaveBeenCalledWith({
			isLoggedIn: false,
			user: null,
			token: undefined,
		});
	});

	it('should handle login error without message', async () => {
		vi.mocked(userApi.login).mockRejectedValueOnce({});

		const { result } = renderHook(() => useLogin());

		let success: boolean = true;
		await act(async () => {
			success = await result.current.login('test@example.com', 'password');
		});

		await waitFor(() => {
			expect(success).toBe(false);
			expect(result.current.error).toBe('Login failed');
		});
	});
});
