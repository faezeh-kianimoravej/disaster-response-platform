import { BaseApi } from '@/api/base';
import type { ChatUser } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const chatUserApi = new BaseApi(`${API_BASE_URL}/chat/users`);

// API DTOs
export interface ChatUserDTO {
	id: number;
	userId: number;
	chatGroupId: number;
	role?: string;
	joinedAt: string;
	lastReadMessageId?: string;
	isActive: boolean;
}

export interface CreateChatUserDTO {
	userId: number;
	chatGroupId: number;
	role?: string;
}

export interface CreateChatUserRequest {
	userId: number;
	chatGroupId: number;
	role?: string;
}

// Mapping functions
function mapChatUserDTOToFrontend(dto: ChatUserDTO): ChatUser {
	const result: ChatUser = {
		id: dto.id,
		userId: dto.userId,
		chatGroupId: dto.chatGroupId,
		joinedAt: new Date(dto.joinedAt),
		isActive: dto.isActive,
	};

	if (dto.role !== undefined) {
		result.role = dto.role;
	}

	if (dto.lastReadMessageId !== undefined) {
		result.lastReadMessageId = dto.lastReadMessageId;
	}

	return result;
}

function mapCreateChatUserRequestToDTO(request: CreateChatUserRequest): CreateChatUserDTO {
	const result: CreateChatUserDTO = {
		userId: request.userId,
		chatGroupId: request.chatGroupId,
	};

	if (request.role !== undefined) {
		result.role = request.role;
	}

	return result;
}

/**
 * Get all chat users
 * GET /chat/users
 */
export async function getAllChatUsers(): Promise<ChatUser[]> {
	const result = await chatUserApi.get<ChatUserDTO[]>('');
	return result.map(mapChatUserDTOToFrontend);
}

/**
 * Get a specific chat user by ID
 * GET /chat/users/{id}
 */
export async function getChatUserById(chatUserId: number): Promise<ChatUser> {
	const result = await chatUserApi.get<ChatUserDTO>(`/${chatUserId}`);
	return mapChatUserDTOToFrontend(result);
}

/**
 * Create a new chat user (add user to chat group)
 * POST /chat/users
 */
export async function createChatUser(request: CreateChatUserRequest): Promise<ChatUser> {
	const dto = mapCreateChatUserRequestToDTO(request);
	const result = await chatUserApi.post<ChatUserDTO>('', dto);
	return mapChatUserDTOToFrontend(result);
}
