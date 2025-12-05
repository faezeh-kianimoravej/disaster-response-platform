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
	type: 'DEFAULT' | 'LEADER' | 'SYSTEM';
	timestamp: string;
	meta?: Record<string, unknown>;
}

export interface Chat {
	id: number;
	incidentId: number;
	name: string;
}
