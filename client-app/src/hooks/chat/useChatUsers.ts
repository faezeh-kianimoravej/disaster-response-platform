import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createChatUser,
	getAllChatUsers,
	getChatUserById,
	type CreateChatUserRequest,
} from '@/api/chat/chatUserApi';
import type { ChatUser } from '@/types/chat';
import { CHAT_QUERY_KEYS } from '@/hooks/queryKeys';
import type { ApiError } from '@/api/base';

// Create chat user mutation
export function useCreateChatUser() {
	const queryClient = useQueryClient();

	return useMutation<ChatUser, ApiError, CreateChatUserRequest>({
		mutationFn: (request: CreateChatUserRequest) => createChatUser(request),
		onSuccess: createdUser => {
			// Update all chat users cache
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.users.all,
			});
			// Set the new user in cache
			queryClient.setQueryData(CHAT_QUERY_KEYS.users.item(createdUser.id), createdUser);
			// Invalidate the related chat group as user count may have changed
			queryClient.invalidateQueries({
				queryKey: CHAT_QUERY_KEYS.groups.item(createdUser.chatGroupId),
			});
		},
	});
}

// Get all chat users query
export function useChatUsers() {
	return useQuery({
		queryKey: CHAT_QUERY_KEYS.users.all,
		queryFn: () => getAllChatUsers(),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

// Get specific chat user by ID query
export function useChatUser(userId: number | undefined) {
	return useQuery({
		queryKey: userId ? CHAT_QUERY_KEYS.users.item(userId) : [],
		queryFn: () => (userId ? getChatUserById(userId) : null),
		enabled: !!userId,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}
