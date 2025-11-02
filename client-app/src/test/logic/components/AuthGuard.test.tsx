import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import AuthGuard from '@/components/auth/AuthGuard';

describe('AuthGuard', () => {
	describe('Basic Authentication', () => {
		it('renders children when user is logged in', () => {
			renderWithProviders(
				<AuthGuard>
					<div>Protected Content</div>
				</AuthGuard>,
				{
					auth: {
						isLoggedIn: true,
						user: {
							userId: 1,
							firstName: 'Test',
							lastName: 'User',
							email: 'test@example.com',
							mobile: '000',
							roles: [
								{ roleType: 'Citizen', regionId: 1, departmentId: null, municipalityId: null },
							],
							deleted: false,
						},
					},
				}
			);

			expect(screen.getByText('Protected Content')).toBeInTheDocument();
		});
	});

	describe('Role-based Authorization', () => {
		it('allows access when user has one of the required roles', () => {
			renderWithProviders(
				<AuthGuard requireRoles={['Region Admin']}>
					<div>Admin Content</div>
				</AuthGuard>,
				{
					auth: {
						isLoggedIn: true,
						user: {
							userId: 1,
							firstName: 'Test',
							lastName: 'User',
							email: 'test@example.com',
							mobile: '000',
							roles: [
								{ roleType: 'Region Admin', regionId: 1, departmentId: null, municipalityId: null },
							],
							deleted: false,
						},
					},
				}
			);

			expect(screen.getByText('Admin Content')).toBeInTheDocument();
		});

		it('denies access when user lacks required roles', () => {
			renderWithProviders(
				<AuthGuard requireRoles={['Region Admin']}>
					<div>Admin Content</div>
				</AuthGuard>,
				{
					auth: {
						isLoggedIn: true,
						user: {
							userId: 1,
							firstName: 'Test',
							lastName: 'User',
							email: 'test@example.com',
							mobile: '000',
							roles: [
								{ roleType: 'Citizen', regionId: 1, departmentId: null, municipalityId: null },
							],
							deleted: false,
						},
					},
				}
			);

			expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
			expect(screen.getByText('Not Authorized')).toBeInTheDocument();
		});
	});

	describe('Region-based Authorization', () => {
		it('allows access when user has access to the required region', () => {
			renderWithProviders(
				<AuthGuard requireAccessToRegion={1}>
					<div>Region Content</div>
				</AuthGuard>,
				{
					auth: {
						isLoggedIn: true,
						user: {
							userId: 1,
							firstName: 'Test',
							lastName: 'User',
							email: 'test@example.com',
							mobile: '000',
							roles: [
								{ roleType: 'Region Admin', regionId: 1, departmentId: null, municipalityId: null },
							],
							deleted: false,
						},
					},
				}
			);

			expect(screen.getByText('Region Content')).toBeInTheDocument();
		});

		it('denies access when user lacks access to the required region', () => {
			renderWithProviders(
				<AuthGuard requireAccessToRegion={2}>
					<div>Region Content</div>
				</AuthGuard>,
				{
					auth: {
						isLoggedIn: true,
						user: {
							userId: 1,
							firstName: 'Test',
							lastName: 'User',
							email: 'test@example.com',
							mobile: '000',
							roles: [
								{ roleType: 'Region Admin', regionId: 1, departmentId: null, municipalityId: null },
							],
							deleted: false,
						},
					},
				}
			);

			expect(screen.queryByText('Region Content')).not.toBeInTheDocument();
			expect(screen.getByText('Not Authorized')).toBeInTheDocument();
		});
	});

	describe('Municipality-based Authorization', () => {
		it('allows access when user has access to the required municipality', () => {
			renderWithProviders(
				<AuthGuard requireAccessToMunicipality={5}>
					<div>Municipality Content</div>
				</AuthGuard>,
				{
					auth: {
						isLoggedIn: true,
						user: {
							userId: 1,
							firstName: 'Test',
							lastName: 'User',
							email: 'test@example.com',
							mobile: '000',
							roles: [
								{
									roleType: 'Municipality Admin',
									regionId: 1,
									departmentId: null,
									municipalityId: 5,
								},
							],
							deleted: false,
						},
					},
				}
			);

			expect(screen.getByText('Municipality Content')).toBeInTheDocument();
		});
	});

	describe('Department-based Authorization', () => {
		it('allows access when user has access to the required department', () => {
			renderWithProviders(
				<AuthGuard requireAccessToDepartment={7}>
					<div>Department Content</div>
				</AuthGuard>,
				{
					auth: {
						isLoggedIn: true,
						user: {
							userId: 1,
							firstName: 'Test',
							lastName: 'User',
							email: 'test@example.com',
							mobile: '000',
							roles: [
								{ roleType: 'Department Admin', regionId: 1, departmentId: 7, municipalityId: 5 },
							],
							deleted: false,
						},
					},
				}
			);

			expect(screen.getByText('Department Content')).toBeInTheDocument();
		});
	});
});
