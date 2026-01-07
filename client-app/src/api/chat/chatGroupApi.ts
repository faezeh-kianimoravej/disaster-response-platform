import { BaseApi } from '@/api/base';
import type { ChatGroup } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const chatGroupApi = new BaseApi(`${API_BASE_URL}/chat/groups`);

// API DTOs
export interface ChatGroupDTO {
	id: number;
	incidentId: number;
	name: string;
	createdAt: string;
	updatedAt?: string;
}

export interface CreateChatGroupDTO {
	incidentId: number;
	name: string;
}

export interface CreateChatGroupRequest {
	incidentId: number;
	name: string;
}

export interface AddUserToChatGroupDTO {
	groupId: number;
	userId: number;
}

// DTO for user groups response (matches backend ChatGroupListItemDto)
export interface UserChatGroupDTO {
	chatGroupId: number;
	incidentId: number;
	title: string;
	createdAt: string;
	isClosed: boolean;
	lastMessage?: {
		chatMessageId: number;
		chatGroupId: number;
		userId: number;
		userFullName?: string;
		userRole?: string;
		messageType: string;
		content: string;
		timestamp: string;
	};
	numberOfUnreadMessages?: number;
}

// Mapping functions
function mapChatGroupDTOToFrontend(dto: ChatGroupDTO): ChatGroup {
	const result: ChatGroup = {
		id: dto.id,
		incidentId: dto.incidentId,
		name: dto.name,
		createdAt: new Date(dto.createdAt),
	};

	if (dto.updatedAt) {
		result.updatedAt = new Date(dto.updatedAt);
	}

	return result;
}

function mapCreateChatGroupRequestToDTO(request: CreateChatGroupRequest): CreateChatGroupDTO {
	return {
		incidentId: request.incidentId,
		name: request.name,
	};
}

// Mapping function for user chat groups
function mapUserChatGroupDTOToFrontend(dto: UserChatGroupDTO): ChatGroup {
	const result: ChatGroup = {
		id: dto.chatGroupId,
		incidentId: dto.incidentId,
		name: dto.title,
		createdAt: new Date(dto.createdAt),
	};

	if (dto.lastMessage) {
		const lastMessage = {
			id: String(dto.lastMessage.chatMessageId),
			content: dto.lastMessage.content,
			timestamp: new Date(dto.lastMessage.timestamp),
			...(dto.lastMessage.userFullName !== undefined && {
				userFullName: dto.lastMessage.userFullName,
			}),
		};
		result.lastMessage = lastMessage;
		result.updatedAt = new Date(dto.lastMessage.timestamp);
	}

	if (dto.numberOfUnreadMessages !== undefined) {
		result.unreadCount = dto.numberOfUnreadMessages;
	}

	return result;
}

/**
 * Create a new chat group
 * POST /chat/groups
 */
export async function createChatGroup(request: CreateChatGroupRequest): Promise<ChatGroup> {
	const dto = mapCreateChatGroupRequestToDTO(request);
	const result = await chatGroupApi.post<ChatGroupDTO>('', dto);
	return mapChatGroupDTOToFrontend(result);
}

/**
 * Get chat groups for a specific user
 * GET /chat/groups/user/{userId}
 */
export async function getChatGroupsByUser(userId: number): Promise<ChatGroup[]> {
	const result = await chatGroupApi.get<UserChatGroupDTO[]>(`/user/${userId}`);
	return result.map(mapUserChatGroupDTOToFrontend);
}

/**
 * Get chat groups for a specific incident
 * GET /chat/groups/incident/{incidentId}
 */
export async function getChatGroupsByIncident(incidentId: number): Promise<ChatGroup[]> {
	const result = await chatGroupApi.get<ChatGroupDTO[]>(`/incident/${incidentId}`);
	return result.map(mapChatGroupDTOToFrontend);
}

/**
 * Get a specific chat group by ID
 * GET /chat/groups/{groupId}
 */
export async function getChatGroupById(groupId: number): Promise<ChatGroup> {
	const result = await chatGroupApi.get<ChatGroupDTO>(`/${groupId}`);
	return mapChatGroupDTOToFrontend(result);
}

/**
 * Add a user to a chat group
 * POST /chat/groups/{groupId}/users/{userId}
 */
export async function addUserToChatGroup(groupId: number, userId: number): Promise<void> {
	await chatGroupApi.post<void>(`/${groupId}/users/${userId}`, {});
}

/**
 * Update the last read message for a user in a chat group
 * PUT /chat/{groupId}/users/{userId}/read
 */
export async function updateLastReadMessage(
	groupId: number,
	userId: number,
	messageId: string
): Promise<void> {
	const chatUserApi = new BaseApi(`${API_BASE_URL}/chat`);
	await chatUserApi.put<void>(`/${groupId}/users/${userId}/read`, {
		messageId: Number(messageId),
	});
}
