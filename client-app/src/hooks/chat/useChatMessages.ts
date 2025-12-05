import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createChatMessage,
	getChatMessagesByGroup,
	getChatMessageById,
	type ChatMessage,
	type CreateChatMessageRequest,
} from '@/api/chat/chatMessageApi';
import { CHAT_QUERY_KEYS } from '@/hooks/queryKeys';
import type { ApiError } from '@/api/base';

// Send/create message mutation
export function useSendMessage() {
	const queryClient = useQueryClient();

	return useMutation<ChatMessage, ApiError, CreateChatMessageRequest>({
		mutationFn: (request: CreateChatMessageRequest) => createChatMessage(request),
		onSuccess: createdMessage => {
			// Update the group's messages cache
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.messages.byGroup(createdMessage.chatGroupId),
			});
			// Update all messages cache
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.messages.all,
			});
			// Set the new message in cache
			queryClient.setQueryData(CHAT_QUERY_KEYS.messages.item(createdMessage.id), createdMessage);
		},
	});
}

// Get messages by group query
export function useMessagesByGroup(groupId: number | undefined) {
	return useQuery({
		queryKey: groupId ? CHAT_QUERY_KEYS.messages.byGroup(groupId) : [],
		queryFn: () => (groupId ? getChatMessagesByGroup(groupId) : []),
		enabled: !!groupId,
		staleTime: 1000 * 60 * 2, // 2 minutes (shorter than groups for real-time feel)
		refetchInterval: 1000 * 30, // Refetch every 30 seconds for new messages
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
