import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createChatMessage,
	getChatMessagesByGroup,
	getChatMessageById,
	type CreateChatMessageRequest,
} from '@/api/chat/chatMessageApi';
import type { ChatMessage } from '@/types/chat';
import { CHAT_QUERY_KEYS } from '@/hooks/queryKeys';
import type { ApiError } from '@/api/base';

// Send/create message mutation
export function useSendMessage() {
	const queryClient = useQueryClient();

	return useMutation<ChatMessage, ApiError, CreateChatMessageRequest>({
		mutationFn: (request: CreateChatMessageRequest) => createChatMessage(request),
		onSuccess: createdMessage => {
			// Don't invalidate messages - SSE will provide real-time updates
			// Just cache the individual message for potential future lookups
			queryClient.setQueryData(CHAT_QUERY_KEYS.messages.item(createdMessage.id), createdMessage);

			// Invalidate groups to update "last message" and "unread count" in the groups list
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.groups.all,
			});
		},
	});
}

// Get messages by group query
export function useMessagesByGroup(groupId: number | undefined) {
	return useQuery({
		queryKey: groupId ? CHAT_QUERY_KEYS.messages.byGroup(groupId) : [],
		queryFn: () => (groupId ? getChatMessagesByGroup(groupId) : []),
		enabled: !!groupId,
		staleTime: 1000 * 60 * 5, // 5 minutes - allow reasonable caching but not forever
		refetchOnWindowFocus: true, // Refetch on window focus to catch missed messages
		refetchOnReconnect: true, // Refetch when network reconnects
	});
}

// Get specific message by ID query
export function useMessageById(messageId: string | undefined) {
	return useQuery({
		queryKey: messageId ? CHAT_QUERY_KEYS.messages.item(messageId) : [],
		queryFn: () => (messageId ? getChatMessageById(messageId) : null),
		enabled: !!messageId,
		staleTime: 1000 * 60 * 10, // 10 minutes (messages don't change often)
	});
}
