import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createResponseUnit,
	getResponseUnitById,
	getResponseUnitsByDepartmentId,
	getAllResponseUnits,
	updateResponseUnit,
	deleteResponseUnit,
} from '@/api/deployment/responseUnit';
import type {
	ResponseUnit,
	ResponseUnitFormData,
	ResponseUnitType,
	AvailableResponseUnitSearchResult,
} from '@/types/responseUnit';
import { searchAvailableResponseUnits } from '@/api/deployment/responseUnit';
import type { ResourceStatus } from '@/types/resource';
import { RESPONSE_UNIT_QUERY_KEYS } from '@/hooks/queryKeys';

export function useResponseUnits(departmentId?: number, options?: { enabled?: boolean }) {
	const enabled = options?.enabled ?? !!departmentId;
	return useQuery<ResponseUnit[], Error>({
		queryKey: departmentId
			? RESPONSE_UNIT_QUERY_KEYS.list(departmentId)
			: RESPONSE_UNIT_QUERY_KEYS.all,
		queryFn: () =>
			departmentId ? getResponseUnitsByDepartmentId(departmentId) : getAllResponseUnits(),
		enabled,
		staleTime: 1000 * 60 * 5,
	});
}

export function useResponseUnit(unitId?: number, options?: { enabled?: boolean }) {
	return useQuery<ResponseUnit | undefined, Error>({
		queryKey: unitId ? RESPONSE_UNIT_QUERY_KEYS.item(unitId) : ['response-unit', 'none'],
		queryFn: () => (unitId ? getResponseUnitById(unitId) : undefined),
		enabled: (options?.enabled ?? true) && !!unitId,
		staleTime: 1000 * 60 * 5,
	});
}

export function useCreateResponseUnit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			form,
			status,
		}: {
			form: ResponseUnitFormData;
			status: ResourceStatus;
		}) => {
			return await createResponseUnit(form, status);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: RESPONSE_UNIT_QUERY_KEYS.all });
		},
	});
}

export function useUpdateResponseUnit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			unitId,
			form,
			status,
		}: {
			unitId: number;
			form: ResponseUnitFormData;
			status: ResourceStatus;
		}) => {
			return await updateResponseUnit(unitId, form, status);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: RESPONSE_UNIT_QUERY_KEYS.all });
		},
	});
}

export function useDeleteResponseUnit() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (unitId: number) => {
			await deleteResponseUnit(unitId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: RESPONSE_UNIT_QUERY_KEYS.all });
		},
	});
}

export interface UseSearchAvailableResponseUnitsParams {
	incidentId: number;
	unitType: ResponseUnitType;
	departmentId?: number;
	municipalityId?: number;
}

export function useSearchAvailableResponseUnits(
	params: UseSearchAvailableResponseUnitsParams,
	options?: { enabled?: boolean }
) {
	const enabled = options?.enabled ?? true;
	return useQuery<AvailableResponseUnitSearchResult[], Error>({
		queryKey: [
			'response-units',
			'search',
			params.incidentId,
			params.unitType,
			params.departmentId,
			params.municipalityId,
		],
		queryFn: () => searchAvailableResponseUnits(params),
		enabled: enabled && !!params.incidentId && !!params.unitType,
		staleTime: 1000 * 60 * 2,
	});
}
