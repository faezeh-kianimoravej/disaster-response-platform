import { z } from 'zod';

// Message type validation
export const messageTypeSchema = z.enum(['DEFAULT', 'LEADER', 'SYSTEM']);

// Message validation schema
export const messageSchema = z.object({
	chatMessageId: z.string().min(1),
	chatGroupId: z.number().positive(),
	userId: z.number().positive().optional(),
	userFullName: z.string().optional(),
	type: messageTypeSchema,
	content: z.string().min(1).max(5000), // Reasonable message length limit
	timestamp: z.string().datetime(), // ISO 8601 format
	meta: z.record(z.unknown()).optional(),
});

// SSE Message validation schema
export const sseMessageSchema = z.object({
	messageId: z.string().min(1),
	chatGroupId: z.number().positive(),
	userId: z.number().positive().optional(),
	userFullName: z.string().optional(),
	content: z.string().min(1).max(5000),
	type: messageTypeSchema,
	timestamp: z.string().datetime(),
	meta: z.record(z.unknown()).optional(),
});

// Chat group validation schema
export const chatGroupSchema = z.object({
	id: z.number().positive(),
	incidentId: z.number().positive(),
	name: z.string().min(1).max(255),
	createdAt: z.date(),
	updatedAt: z.date().optional(),
});

// Create message request validation
export const createMessageRequestSchema = z.object({
	chatGroupId: z.number().positive(),
	userId: z.number().positive(),
	content: z.string().min(1).max(5000),
	type: messageTypeSchema.default('DEFAULT'),
});

// Create chat group request validation
export const createChatGroupRequestSchema = z.object({
	incidentId: z.number().positive(),
	name: z.string().min(1).max(255),
});

// Export types inferred from schemas
export type MessageValidation = z.infer<typeof messageSchema>;
export type SSEMessageValidation = z.infer<typeof sseMessageSchema>;
export type ChatGroupValidation = z.infer<typeof chatGroupSchema>;
export type CreateMessageRequestValidation = z.infer<typeof createMessageRequestSchema>;
export type CreateChatGroupRequestValidation = z.infer<typeof createChatGroupRequestSchema>;
