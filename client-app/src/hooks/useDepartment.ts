import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getDepartmentsByMunicipalityId,
	getDepartmentById,
	addDepartment,
	updateDepartment,
	deleteDepartment,
	getAllDepartments,
} from '@/api/department';
import type { Department, DepartmentFormData } from '@/types/department';
import { DEPARTMENT_QUERY_KEYS } from '@/hooks/queryKeys';

export function useDepartments(municipalityId?: number, options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? !!municipalityId;
	const listKey = municipalityId
		? DEPARTMENT_QUERY_KEYS.list(municipalityId)
		: ['departments', 'none'];

	const listQuery = useQuery<Department[], Error>({
		queryKey: listKey,
		queryFn: () => getDepartmentsByMunicipalityId(municipalityId as number),
		enabled: enabled && !!municipalityId,
		staleTime: 1000 * 60 * 5,
	});

	const { data, isLoading, isFetching, error, refetch } = listQuery;

	return useMemo(
		() => ({
			departments: data ?? [],
			loading: isLoading,
			isFetching,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, isFetching, error, refetch]
	);
}

export function useDepartment(id?: number, options?: { enabled?: boolean }) {
	const queryClient = useQueryClient();

	const singleQuery = useQuery<Department | undefined, Error>({
		queryKey: id ? DEPARTMENT_QUERY_KEYS.item(id) : ['department', 'none'],
		queryFn: () => getDepartmentById(id as number),
		enabled: (options?.enabled ?? true) && !!id,
		staleTime: 1000 * 60 * 5,
	});

	const {
		data: departmentData,
		isLoading: departmentLoading,
		error: departmentError,
		refetch: refetchSingle,
	} = singleQuery;

	const fetchDepartment = async () => {
		if (!id) return undefined;
		return queryClient.fetchQuery({
			queryKey: DEPARTMENT_QUERY_KEYS.item(id),
			queryFn: () => getDepartmentById(id as number),
		});
	};

	return useMemo(
		() => ({
			department: departmentData ?? null,
			loading: departmentLoading,
			error: departmentError?.message ?? null,
			refetch: refetchSingle,
			fetchDepartment,
		}),
		[departmentData, departmentLoading, departmentError, refetchSingle, fetchDepartment]
	);
}

export function useCreateDepartment(municipalityId: number) {
	const queryClient = useQueryClient();
	return useMutation<Department, Error, DepartmentFormData>({
		mutationFn: data => addDepartment(data as unknown as Department),
		onSuccess: saved => {
			queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(municipalityId) });
			queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.item(saved.departmentId), saved);
		},
	});
}

export function useUpdateDepartment(municipalityId: number) {
	const queryClient = useQueryClient();
	return useMutation<Department, Error, { id: number; data: DepartmentFormData }>({
		mutationFn: ({ id, data }) =>
			updateDepartment({ ...(data as unknown as Department), departmentId: id } as Department),
		onSuccess: updated => {
			queryClient.setQueryData(DEPARTMENT_QUERY_KEYS.item(Number(updated.departmentId)), updated);
			queryClient.invalidateQueries({ queryKey: DEPARTMENT_QUERY_KEYS.list(municipalityId) });
		},
	});
}

export function useDeleteDepartment() {
	const queryClient = useQueryClient();
	return useMutation<void, Error, { id: number; municipalityId: number }>({
		mutationFn: ({ id }) => deleteDepartment(id),
		onSuccess: (_data, { id, municipalityId }) => {
			const listKey = DEPARTMENT_QUERY_KEYS.list(municipalityId);
			const itemKey = DEPARTMENT_QUERY_KEYS.item(id);

			const cachedList = queryClient.getQueryData<Department[]>(listKey);
			if (cachedList) {
				const filteredList = cachedList.filter(d => Number(d.departmentId) !== Number(id));
				queryClient.setQueryData(listKey, filteredList);
			}

			queryClient.removeQueries({ queryKey: itemKey });
		},
	});
}

export function useAllDepartments(options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? true;

	const allQuery = useQuery<Department[], Error>({
		queryKey: DEPARTMENT_QUERY_KEYS.all,
		queryFn: () => getAllDepartments(),
		enabled: enabled,
		staleTime: 1000 * 60 * 10, // 10 minutes - departments don't change often
	});

	const { data, isLoading, isFetching, error, refetch } = allQuery;

	return useMemo(
		() => ({
			departments: data ?? [],
			loading: isLoading,
			isFetching,
			error: error?.message ?? null,
			refetch,
		}),
		[data, isLoading, isFetching, error, refetch]
	);
}
