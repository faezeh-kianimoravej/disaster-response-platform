export type MessageType = 'DEFAULT' | 'LEADER' | 'SYSTEM';

export interface Message {
	chatMessageId: string;
	chatGroupId: number;
	userId?: number | undefined;
	userFullName?: string | undefined;
	type: MessageType;
	content: string;
	timestamp: string; // ISO
	meta?: Record<string, unknown> | undefined;
}

export interface SSEMessage {
	messageId: string;
	chatGroupId: number;
	userId?: number;
	userFullName?: string;
	content: string;
	type: MessageType;
	timestamp: string;
	meta?: Record<string, unknown>;
}

export interface Chat {
	id: number;
	incidentId: number;
	name: string;
}

export interface ChatGroup {
	id: number;
	incidentId: number;
	name: string;
	createdAt: Date;
	updatedAt?: Date;
	lastMessage?: {
		id: string;
		content: string;
		timestamp: Date;
		userFullName?: string;
	};
	unreadCount?: number;
}

export interface ChatUser {
	id: number;
	userId: number;
	chatGroupId: number;
	role?: string;
	joinedAt: Date;
	lastReadMessageId?: string;
	isActive: boolean;
}

export interface ChatMessage {
	id: string;
	chatGroupId: number;
	userId: number;
	userFullName?: string;
	type: MessageType;
	content: string;
	timestamp: Date;
	updatedAt?: Date;
	meta?: Record<string, unknown>;
}
