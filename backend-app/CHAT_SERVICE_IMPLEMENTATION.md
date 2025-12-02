# Chat Service Implementation Task List

## Overview

This document outlines the complete implementation plan for the new **chat-service** microservice in the DRCCS backend application.

## Service Requirements

- Real-time chat functionality for incident-based communication
- SSE (Server-Sent Events) for live message delivery
- Integration with user-service via Feign client
- PostgreSQL database for persistence
- Eureka service discovery integration
- Docker support (dev & release)

---

## 📋 Implementation Tasks

### Phase 1: Project Setup & Structure

- [ ] Create chat-service directory structure
- [ ] Copy and configure Maven wrapper (mvnw, mvnw.cmd)
- [ ] Create pom.xml with all required dependencies
  - Spring Boot Starter Web
  - Spring Boot Starter Data JPA
  - Spring Cloud Eureka Client
  - Spring Cloud OpenFeign
  - PostgreSQL Driver
  - Lombok
  - Validation
  - SpringDoc OpenAPI (Swagger)
- [ ] Create main application class with proper annotations
- [ ] Create application.yml / application-dev.yml configuration files
- [ ] Add chat-service module to parent pom.xml

### Phase 2: Database Layer - Entities

- [ ] **ChatGroup Entity**
  - `chatGroupId` (Long, Primary Key, Auto-generated)
  - `incidentId` (Long, FK to incident)
  - `title` (String)
  - `createdAt` (LocalDateTime)
  - `isClosed` (Boolean)
  - Relationships: One-to-Many with ChatMessage and ChatUser
- [ ] **ChatMessage Entity**
  - `chatMessageId` (Long, Primary Key, Auto-generated)
  - `chatGroupId` (Long, FK to ChatGroup)
  - `userId` (Long, FK to user-service)
  - `content` (String, Text)
  - `timestamp` (LocalDateTime)
  - Relationships: Many-to-One with ChatGroup
- [ ] **ChatUser Entity** (Junction/Association table with extra data)
  - `chatUserId` (Long, Primary Key, Auto-generated)
  - `chatGroupId` (Long, FK to ChatGroup)
  - `userId` (Long, FK to user-service)
  - `userFullName` (String, denormalized for performance)
  - `userRole` (String, denormalized)
  - `lastReadMessageId` (Long, nullable)
  - Relationships: Many-to-One with ChatGroup

### Phase 3: Repository Layer

- [ ] ChatGroupRepository (extends JpaRepository)
  - Custom query: findByIncidentId
  - Custom query: findByIdAndIsClosedFalse
  - Custom query: findAllByUserId (via ChatUser join)
- [ ] ChatMessageRepository (extends JpaRepository)
  - Custom query: findByChatGroupIdOrderByTimestampAsc
  - Custom query: countByChatGroupIdAndIdGreaterThan (for unread count)
- [ ] ChatUserRepository (extends JpaRepository)
  - Custom query: findByChatGroupId
  - Custom query: findByUserId

### Phase 4: DTOs (Data Transfer Objects)

- [ ] **ChatGroupRequestDto**
  - incidentId, title
- [ ] **ChatGroupResponseDto**
  - id, incidentId, title, createdAt, isClosed, lastMessage (nested), unreadCount
- [ ] **ChatMessageRequestDto**
  - chatGroupId, chatUserId, content
- [ ] **ChatMessageResponseDto**
  - id, chatGroupId, userId, userFullName, userRole, content, timestamp
- [ ] **ChatUserRequestDto**
  - chatGroupId, userId
- [ ] **ChatUserResponseDto**
  - id, chatGroupId, userId, userFullName, userRole, lastReadMessageId
- [ ] **LastReadUpdateRequestDto**
  - chatGroupId, userId, messageId
- [ ] **ChatGroupListItemDto** (for list view with extra computed fields)
  - All ChatGroupResponseDto fields + numberOfUnreadMessages + lastMessage

### Phase 5: Feign Client

- [ ] Create UserServiceClient interface with @FeignClient annotation
  - getUserById(Long userId) -> UserResponseDto
  - getUsersByIds(List<Long> userIds) -> List<UserResponseDto>
- [ ] Enable @EnableFeignClients in main application class
- [ ] Configure Feign client properties in application.yml

### Phase 6: Service Layer - Interfaces

- [ ] **ChatGroupService** interface
  - createChatGroupForIncident(incidentId, title)
  - getChatGroupById(groupId)
  - getChatGroupsByUserId(userId)
  - closeChatGroup(groupId)
- [ ] **ChatMessageService** interface
  - sendMessage(chatGroupId, userId, content)
  - getMessagesByGroupId(chatGroupId)
  - getMessagesAfterMessageId(chatGroupId, messageId)
- [ ] **ChatUserService** interface
  - addUserToGroup(chatGroupId, userId)
  - removeUserFromGroup(chatGroupId, userId)
  - updateLastReadMessage(chatGroupId, userId, messageId)
  - getUsersInGroup(chatGroupId)
  - getUnreadMessageCount(chatGroupId, userId)
- [ ] **ChatSseService** interface (for SSE management)
  - addEmitter(chatGroupId, userId)
  - sendMessageToGroup(chatGroupId, messageDto)
  - removeEmitter(chatGroupId, userId)

### Phase 7: Service Layer - Implementations

- [ ] **ChatGroupServiceImpl**
  - Implement all methods from interface
  - Validation logic
- [ ] **ChatMessageServiceImpl**
  - Implement all methods from interface
  - Trigger SSE notification on new message
  - Integration with chatUserService to get user details
- [ ] **ChatUserServiceImpl**
  - Implement all methods from interface
  - Calculate unread counts
  - Fetch user details via Feign client for denormalization
- [ ] **ChatSseServiceImpl**
  - Manage SseEmitter instances per chat group
  - Handle connection lifecycle (timeout, error, completion)
  - Thread-safe emitter management (ConcurrentHashMap + CopyOnWriteArrayList)
  - Send events to all connected clients in a group

### Phase 8: Controller Layer

- [ ] **ChatGroupController**
  - POST /api/chat/groups - Create new chat group for incident
  - GET /api/chat/groups/{groupId} - Get chat group details
  - GET /api/chat/groups/user/{userId} - Get all chat groups for a user
  - PUT /api/chat/groups/{groupId}/close - Close a chat group
  - Swagger/OpenAPI annotations
- [ ] **ChatMessageController**
  - POST /api/chat/{groupId}/messages - Send new message
  - GET /api/chat/{groupId}/messages - Get messages
  - Swagger/OpenAPI annotations
- [ ] **ChatUserController**
  - POST /api/chat/{groupId}/users - Add user to group
  - DELETE /api/chat/{groupId}/users/{userId} - Remove user
  - PUT /api/chat/{groupId}/users/{userId}/read - Update last read message
  - GET /api/chat/{groupId}/users - Get all users in group
  - Swagger/OpenAPI annotations
- [ ] **ChatSseController**
  - GET /api/chat/{groupId}/subscribe - SSE endpoint for live messages
  - Handle query param for userId (authentication context)
  - Handle lastMessageId for reconnection recovery
  - Proper Content-Type and headers for SSE

### Phase 9: Exception Handling & Validation

- [ ] Create custom exceptions
  - ChatGroupNotFoundException
  - ChatUserNotFoundException
  - UnauthorizedChatAccessException
- [ ] Global exception handler (@RestControllerAdvice)
  - Map exceptions to appropriate HTTP status codes
- [ ] Add validation annotations to DTOs
  - @NotNull, @NotBlank, @Size, @Min, etc.
  - Create validation groups if needed

### Phase 10: Configuration & Properties

- [ ] application.yml
  - Server port 8089
  - Database connection (PostgreSQL)
  - Eureka client configuration
  - Feign client configuration
  - JPA/Hibernate settings
  - Logging configuration
- [ ] application-local-single.properties (development overrides for single service build)
- [ ] application-local-docker.properties (development overrides for full application)
- [ ] application-prod.properties (production)

### Phase 11: Docker Configuration

- [ ] Create Dockerfile
  - Multi-stage build with Maven
  - Use Eclipse Temurin JDK 21
  - Expose appropriate port
- [ ] Update ./backend-app/docker-compose.yml (dev version)
  - Add chat-service service definition
  - Configure environment variables
  - Link to postgres-db and discovery-service
  - Add to backend-network
  - Set up proper dependencies (depends_on)
- [ ] Update ./release/docker-compose.yml (release version)
  - Similar configuration for production

### Phase 12: Database Initialization

- [ ] Update init-scripts/init-databases.sql
  - Create `chat_db` database
  - Grant appropriate permissions

### Phase 13: API Gateway Configuration

- [ ] Update api-gateway routing configuration
  - Add route for chat-service regular HTTP requests (/api/chat/**)
  - Add route for chat-service SSE endpoint (/api/chat/{groupId}/subscribe)
  - Configure appropriate timeouts for SSE connections

### Phase 14: Testing Preparation

- [ ] Add test dependencies to pom.xml
  - Spring Boot Starter Test
  - H2 Database (for testing)
  - Mockito
- [ ] Create test application.yml
- [ ] Set up test directory structure
- [ ] Write tests

### Phase 15: Build & Integration

- [ ] Update parent pom.xml modules list
- [ ] Verify Maven build succeeds

  ```bash
  mvn clean install
  ```

- [ ] Test Docker dev build

  ```bash
  docker-compose -f docker-compose-dev.yml build chat-service
  ```

- [ ] Test Docker dev run

  ```bash
  docker-compose -f docker-compose-dev.yml up chat-service
  ```

- [ ] Verify service registration with Eureka
- [ ] Test endpoints with Swagger UI

### Phase 16: API Documentation

- [ ] Add comprehensive Swagger/OpenAPI annotations
  - @Tag for controller grouping
  - @Operation for each endpoint
  - @ApiResponses for different status codes
  - @Schema for DTOs
- [ ] Create API documentation in README.md

---

## 🔧 Technical Specifications

### Dependencies (pom.xml)

```xml
- spring-boot-starter-web (3.3.5)
- spring-boot-starter-data-jpa (3.3.5)
- spring-cloud-starter-netflix-eureka-client
- spring-cloud-starter-openfeign
- postgresql (runtime)
- lombok
- springdoc-openapi-starter-webmvc-ui
- spring-boot-starter-validation
```

### Database Schema

```
chat_db
├── chat_groups
├── chat_messages
└── chat_users
```


## 📝 Notes & Considerations

1. **SSE Connection Management**

   - Use `SseEmitter` with timeout (Long.MAX_VALUE for persistent connections)
   - Implement reconnection logic with lastMessageId parameter
   - Clean up emitters on timeout/error/completion
   - Consider heartbeat messages to keep connections alive

2. **User Data Denormalization**

   - Store userFullName and userRole in ChatUser for performance
   - Update via Feign client when user added to group
   - Consider event-driven updates if user data changes

3. **Unread Message Calculation**

   - Efficient query: count messages with id > lastReadMessageId

4. **Frontend Integration Points**
   - Ensure DTOs match frontend TypeScript types

---

## 🚀 Execution Order

**Recommended implementation sequence:**

1. Setup → Database → Repository → DTOs → Feign Client
2. Service Layer (business logic)
3. Controller Layer (API)
4. SSE Implementation
5. Docker & Configuration
6. Testing & Validation
7. Documentation

---

## ✅ Definition of Done

- [ ] All entities, repositories, services, and controllers implemented
- [ ] SSE live messaging works correctly
- [ ] Feign client successfully calls user-service
- [ ] Docker dev build completes successfully
- [ ] Service registers with Eureka
- [ ] All endpoints tested via Swagger UI
- [ ] Database migrations applied
- [ ] README documentation complete
- [ ] Code follows existing project conventions (Lombok, validation, logging)

---

**Last Updated**: December 2, 2025
**Status**: Ready for Implementation
