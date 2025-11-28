import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User, UserCreateFormData, UserEditFormData } from '@/types/user';
import {
	createUser,
	updateUser,
	removeUser,
	getUser,
	getUserByEmail,
	listUsers,
	getUsersByRegion,
	getUsersByMunicipality,
	getUsersByDepartment,
} from '@/api/user';
import type { ApiError } from '@/api/base';
import { USER_QUERY_KEYS } from '@/hooks/queryKeys';

// Create
export function useCreateUser() {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

	const mutation = useMutation<User, ApiError, UserCreateFormData>({
		mutationFn: data => createUser(data),
		onSuccess: saved => {
			setUser(saved);
			setError(null);
			setValidationErrors(null);
			// Update caches
			queryClient.setQueryData(USER_QUERY_KEYS.item(saved.userId), saved);
			queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list });
		},
		onError: err => {
			setError(err.message);
			if (err.validationErrors) {
				setValidationErrors(err.validationErrors);
			}
		},
	});

	async function submit(formData: UserCreateFormData) {
		try {
			await mutation.mutateAsync(formData);
			return true;
		} catch (err) {
			throw err;
		}
	}

	return {
		submit,
		loading: mutation.isPending,
		error,
		validation: validationErrors,
		user,
	};
}

// Update
export function useUpdateUser() {
	const queryClient = useQueryClient();
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<Record<string, string> | null>(null);

	const mutation = useMutation<User, ApiError, UserEditFormData>({
		mutationFn: data => updateUser(data),
		onSuccess: updated => {
			setUser(updated);
			setError(null);
			setValidationErrors(null);
			// Update caches
			queryClient.setQueryData(USER_QUERY_KEYS.item(updated.userId), updated);
			queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list });
		},
		onError: err => {
			setError(err.message);
			if (err.validationErrors) {
				setValidationErrors(err.validationErrors);
			}
		},
	});

	async function submit(formData: UserEditFormData) {
		try {
			await mutation.mutateAsync(formData);
			return true;
		} catch (err) {
			throw err;
		}
	}

	return {
		submit,
		loading: mutation.isPending,
		error,
		validation: validationErrors,
		user,
	};
}

// List
export function useUsers(options?: { enabled?: boolean }) {
	const listQuery = useQuery<User[], Error>({
		queryKey: USER_QUERY_KEYS.list,
		queryFn: () => listUsers(),
		enabled: options?.enabled ?? true,
		staleTime: 1000 * 60 * 5,
	});

	const { data, isLoading, isFetching, error, refetch } = listQuery;
	return useMemo(
		() => ({
			users: data ?? [],
			loading: isLoading,
			isFetching,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, isFetching, error, refetch]
	);
}

export function useUsersByRegion(regionId?: number, options?: { enabled?: boolean }) {
	const enabled = (options?.enabled ?? !!regionId) && !!regionId;
	const listQuery = useQuery<User[], Error>({
		queryKey: regionId ? USER_QUERY_KEYS.byRegion(regionId) : ['users', 'region', 'none'],
		queryFn: () => getUsersByRegion(regionId as number),
		enabled,
		staleTime: 1000 * 60 * 5,
	});
	const { data, isLoading, isFetching, error, refetch } = listQuery;
	return useMemo(
		() => ({
			users: data ?? [],
			loading: isLoading,
			isFetching,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, isFetching, error, refetch]
	);
}

export function useUsersByMunicipality(municipalityId?: number, options?: { enabled?: boolean }) {
	const enabled = (options?.enabled ?? !!municipalityId) && !!municipalityId;
	const listQuery = useQuery<User[], Error>({
		queryKey: municipalityId
			? USER_QUERY_KEYS.byMunicipality(municipalityId)
			: ['users', 'municipality', 'none'],
		queryFn: () => getUsersByMunicipality(municipalityId as number),
		enabled,
		staleTime: 1000 * 60 * 5,
	});
	const { data, isLoading, isFetching, error, refetch } = listQuery;
	return useMemo(
		() => ({
			users: data ?? [],
			loading: isLoading,
			isFetching,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, isFetching, error, refetch]
	);
}

export function useUsersByDepartment(departmentId?: number, options?: { enabled?: boolean }) {
	const enabled = (options?.enabled ?? !!departmentId) && !!departmentId;
	const listQuery = useQuery<User[], Error>({
		queryKey: departmentId
			? USER_QUERY_KEYS.byDepartment(departmentId)
			: ['users', 'department', 'none'],
		queryFn: () => getUsersByDepartment(departmentId as number),
		enabled,
		staleTime: 1000 * 60 * 5,
	});
	const { data, isLoading, isFetching, error, refetch } = listQuery;
	return useMemo(
		() => ({
			users: data ?? [],
			loading: isLoading,
			isFetching,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, isFetching, error, refetch]
	);
}

// Single
export function useUser(id?: number | string, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();
	const singleQuery = useQuery<User | undefined, Error>({
		queryKey: id ? USER_QUERY_KEYS.item(id) : ['user', 'none'],
		queryFn: () => getUser(id as number),
		enabled: (options?.enabled ?? true) && !!id,
		staleTime: 1000 * 60 * 5,
	});

	const { data, isLoading, error, refetch } = singleQuery;
	const fetchUser = async (userId?: number | string) => {
		const uid = userId ?? id;
		if (!uid) return undefined;
		return queryClient.fetchQuery({
			queryKey: USER_QUERY_KEYS.item(uid),
			queryFn: () => getUser(uid),
		});
	};

	return useMemo(
		() => ({
			user: data ?? null,
			loading: isLoading,
			error: error?.message ?? null,
			refetch,
			fetchUser,
		}),
		[data, isLoading, error, refetch]
	);
}

// Fetch user by email
export function useUserByEmail(email?: string, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();
	const enabled = (options?.enabled ?? !!email) && !!email;
	const singleQuery = useQuery<User | undefined, Error>({
		queryKey: email ? USER_QUERY_KEYS.byEmail(email) : ['user', 'none'],
		queryFn: () => getUserByEmail(email as string),
		enabled,
		staleTime: 1000 * 60 * 5,
	});

	const { data, isLoading, error, refetch } = singleQuery;

	const fetchUser = async (emailArg?: string) => {
		const e = emailArg ?? email;
		if (!e) return undefined;
		return queryClient.fetchQuery({
			queryKey: USER_QUERY_KEYS.byEmail(e),
			queryFn: () => getUserByEmail(e),
		});
	};

	return useMemo(
		() => ({
			user: data ?? null,
			loading: isLoading,
			error: error?.message ?? null,
			refetch,
			fetchUser,
		}),
		[data, isLoading, error, refetch]
	);
}

// Delete
export function useRemoveUser() {
	const queryClient = useQueryClient();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const mutation = useMutation<void, Error, { userId: string | number } | string | number>({
		mutationFn: args => removeUser(typeof args === 'object' ? args.userId : args),
		onSuccess: (_data, args) => {
			const id = typeof args === 'object' ? args.userId : args;
			setError(null);
			setSuccess(true);
			// Remove specific user cache and refresh lists
			queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.item(id) });
			queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.list });
		},
		onError: err => {
			setError(err.message);
			setSuccess(false);
		},
	});

	async function remove(userId: string) {
		try {
			await mutation.mutateAsync(userId);
			return true;
		} catch {
			return false;
		}
	}

	return { remove, loading: mutation.isPending, error, success };
}
