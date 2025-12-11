import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createChatGroup,
	getChatGroupById,
	getChatGroupsByUser,
	addUserToChatGroup,
	updateLastReadMessage,
	type CreateChatGroupRequest,
} from '@/api/chat/chatGroupApi';
import type { ChatGroup } from '@/types/chat';
import { CHAT_QUERY_KEYS } from '@/hooks/queryKeys';
import type { ApiError } from '@/api/base';

// -----------------------------
// Group creation / modification hooks
// -----------------------------
export function useCreateChatGroup() {
	const queryClient = useQueryClient();

	return useMutation<ChatGroup, ApiError, CreateChatGroupRequest>({
		mutationFn: (request: CreateChatGroupRequest) => createChatGroup(request),
		onSuccess: createdGroup => {
			// Update all groups cache
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.groups.all,
			});
			// Set the new group in cache
			queryClient.setQueryData(CHAT_QUERY_KEYS.groups.item(createdGroup.id), createdGroup);
		},
	});
}

export function useAddUserToChatGroup() {
	const queryClient = useQueryClient();

	return useMutation<void, ApiError, { groupId: number; userId: number }>({
		mutationFn: ({ groupId, userId }) => addUserToChatGroup(groupId, userId),
		onSuccess: (_, { groupId }) => {
			queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.groups.item(groupId) });
			queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.users.all });
		},
	});
}

// -----------------------------
// Read hooks (list / item)
// -----------------------------
export function useChatGroupById(groupId: number | undefined) {
	return useQuery({
		queryKey: groupId ? CHAT_QUERY_KEYS.groups.item(groupId) : [],
		queryFn: () => (groupId ? getChatGroupById(groupId) : null),
		enabled: !!groupId,
		staleTime: 1000 * 60 * 5,
	});
}

export const useChatGroups = (userId?: number | null) => {
	return useQuery({
		queryKey: [...CHAT_QUERY_KEYS.groups.all, userId ?? 'anonymous'],
		queryFn: () => getChatGroupsByUser(userId as number),
		enabled: userId !== null && userId !== undefined,
		staleTime: 5 * 60 * 1000,
	});
};

export const useChatGroupsByUser = (userId: number) => {
	return useQuery({
		queryKey: [...CHAT_QUERY_KEYS.groups.all, 'user', userId],
		queryFn: () => getChatGroupsByUser(userId),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
	});
};

export const useChatGroupId = (incidentId: number, userId?: number | null) => {
	return useQuery({
		queryKey: [
			...CHAT_QUERY_KEYS.groups.all,
			'incident',
			incidentId,
			'groupId',
			userId ?? 'anonymous',
		],
		queryFn: async (): Promise<number | null> => {
			if (!userId) return null;
			const groups = await getChatGroupsByUser(userId);
			const group = groups.find(g => g.incidentId === incidentId);
			return group ? group.id : null;
		},
		enabled: !!incidentId && !!userId,
		staleTime: 5 * 60 * 1000,
	});
};

export const useChatGroup = (groupId: number) => {
	return useQuery({
		queryKey: CHAT_QUERY_KEYS.groups.item(groupId),
		queryFn: () => getChatGroupById(groupId),
		enabled: !!groupId,
		staleTime: 5 * 60 * 1000,
	});
};

export const useMarkMessagesRead = () => {
	const queryClient = useQueryClient();

	return useMutation<void, ApiError, { groupId: number; userId: number; messageId: string }>({
		mutationFn: ({ groupId, userId, messageId }) =>
			updateLastReadMessage(groupId, userId, messageId),
		onSuccess: () => {
			// Invalidate groups to update unread counts
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.groups.all,
			});
		},
	});
};
