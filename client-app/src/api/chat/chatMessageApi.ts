import { BaseApi } from '@/api/base';
import type { MessageType, ChatMessage } from '@/types/chat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create API instance for chat endpoints
const chatApi = new BaseApi(`${API_BASE_URL}/chat`);

// ------------------------------
// Backend DTOs (exact structure)
// ------------------------------
export interface ChatMessageDTO {
	chatMessageId: number; // Backend sends chatMessageId as Long
	chatGroupId: number;
	userId: number; // REQUIRED
	userFullName?: string;
	userRole?: string;
	messageType: string; // Backend sends messageType
	content: string;
	timestamp: string;
	updatedAt?: string;
	meta?: Record<string, unknown>;
}

export interface CreateChatMessageDTO {
	userId: number; // REQUIRED
	type: MessageType;
	content: string;
	meta?: Record<string, unknown>;
}

export interface CreateChatMessageRequest {
	chatGroupId: number;
	userId: number; // REQUIRED
	type: MessageType;
	content: string;
	meta?: Record<string, unknown>;
}

// ------------------------------
// Mapping Functions
// ------------------------------
function mapChatMessageDTOToFrontend(dto: ChatMessageDTO): ChatMessage {
	return {
		id: String(dto.chatMessageId), // Convert chatMessageId (number) to id (string)
		chatGroupId: dto.chatGroupId,
		userId: dto.userId,
		...(dto.userFullName && { userFullName: dto.userFullName }),
		type: (dto.messageType || 'DEFAULT') as MessageType, // Convert messageType to type
		content: dto.content,
		timestamp: new Date(dto.timestamp),
		...(dto.updatedAt && { updatedAt: new Date(dto.updatedAt) }),
		...(dto.meta && { meta: dto.meta }),
	};
}

function mapCreateChatMessageRequestToDTO(request: CreateChatMessageRequest): CreateChatMessageDTO {
	const dto = {
		userId: request.userId,
		content: request.content,
		type: request.type ?? 'DEFAULT',
		...(request.meta && Object.keys(request.meta).length > 0 && { meta: request.meta }),
	};
	return dto;
}

// ------------------------------
// API Functions
// ------------------------------
export async function createChatMessage(request: CreateChatMessageRequest): Promise<ChatMessage> {
	const dto = mapCreateChatMessageRequestToDTO(request);

	try {
		const result = await chatApi.post<ChatMessageDTO>(`/${request.chatGroupId}/messages`, dto);

		return mapChatMessageDTOToFrontend(result);
	} catch (error) {
		throw error;
	}
}

export async function getChatMessagesByGroup(groupId: number): Promise<ChatMessage[]> {
	try {
		const result = await chatApi.get<ChatMessageDTO[]>(`/${groupId}/messages`);
		return result.map(mapChatMessageDTOToFrontend);
	} catch {
		return [];
	}
}

export async function getChatMessageById(messageId: string): Promise<ChatMessage> {
	const result = await chatApi.get<ChatMessageDTO>(`/messages/${messageId}`);
	return mapChatMessageDTOToFrontend(result);
}
