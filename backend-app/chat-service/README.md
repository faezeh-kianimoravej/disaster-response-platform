# Chat Service API Documentation

This document provides comprehensive API documentation for the Chat Service microservice.

## Overview

The Chat Service provides real-time communication capabilities for incident response teams. Key features:

- **One Chat Group Per Incident**: Each incident has exactly one associated chat group
- **Role-Based Message Types**: Messages are automatically typed based on user roles
  - `LEADER`: Admins, commanders, and department/region/municipality leaders
  - `DEFAULT`: Regular users and responders
  - `SYSTEM`: Automated system messages
- **Real-Time Updates**: Server-Sent Events (SSE) for live message streaming
- **Read Receipts**: Track which messages each user has read
- **User Integration**: Fetches user details (name, role) from User Service

## Base URL

- **Local**: `http://localhost:8089`
- **Production**: Via API Gateway at `http://localhost:8080/api/chat`

---

## Endpoints

### Chat Groups

#### 1. Create Chat Group

Creates a new chat group for an incident. **Note**: Only one chat group can exist per incident. If a chat group already exists for the incident, the existing group is returned instead of creating a duplicate.

**Endpoint**: `POST /api/chat/groups`

**Request Body**:

```json
{
  "incidentId": 1,
  "title": "Emergency Response - Fire"
}
```

**Response** (201 Created or 200 OK if existing):

```json
{
  "chatGroupId": 1,
  "incidentId": 1,
  "title": "Emergency Response - Fire",
  "createdAt": "2025-12-02T12:00:00",
  "isClosed": false
}
```

---

#### 2. Get Chat Group by ID

Retrieves details of a specific chat group.

**Endpoint**: `GET /api/chat/groups/{id}`

**Response** (200 OK):

```json
{
  "chatGroupId": 1,
  "incidentId": 1,
  "title": "Emergency Response - Fire",
  "createdAt": "2025-12-02T12:00:00",
  "isClosed": false
}
```

---

#### 3. Get User's Chat Groups

Lists all chat groups a user is part of, including unread message counts.

**Endpoint**: `GET /api/chat/groups/user/{userId}`

**Response** (200 OK):

```json
[
  {
    "chatGroupId": 1,
    "incidentId": 1,
    "title": "Emergency Response - Fire",
    "createdAt": "2025-12-02T12:00:00",
    "isClosed": false,
    "unreadCount": 5,
    "lastMessage": {
      "chatMessageId": 42,
      "chatGroupId": 1,
      "userId": 2,
      "content": "On my way to the scene",
      "timestamp": "2025-12-02T12:30:00"
    }
  }
]
```

---

#### 4. Close Chat Group

Closes a chat group (prevents new messages).

**Endpoint**: `PUT /api/chat/groups/{id}/close`

**Response** (204 No Content)

---

### Chat Messages

#### 5. Send Message

Sends a new message to a chat group. The message type is automatically determined based on the sender's role:

- Users with roles containing "ADMIN", "LEADER", or "COMMANDER" send `LEADER` type messages
- All other users send `DEFAULT` type messages

**Endpoint**: `POST /api/chat/{groupId}/messages`

**Request Body**:

```json
{
  "userId": 2,
  "content": "Fire truck deployed to location"
}
```

**Response** (201 Created):

```json
{
  "chatMessageId": 42,
  "chatGroupId": 1,
  "userId": 2,
  "userFullName": "Mike Johnson",
  "userRole": "FIRE_DEPARTMENT",
  "messageType": "DEFAULT",
  "content": "Fire truck deployed to location",
  "timestamp": "2025-12-02T12:30:00"
}
```

---

#### 6. Get Messages

Retrieves all messages in a chat group (ordered by timestamp).

**Endpoint**: `GET /api/chat/{groupId}/messages`

**Response** (200 OK):

```json
[
  {
    "chatMessageId": 40,
    "chatGroupId": 1,
    "userId": 1,
    "userFullName": "Jane Smith",
    "userRole": "REGION_ADMIN",
    "messageType": "LEADER",
    "content": "Emergency at Main Street",
    "timestamp": "2025-12-02T12:00:00"
  },
  {
    "chatMessageId": 41,
    "chatGroupId": 1,
    "userId": 2,
    "userFullName": "Mike Johnson",
    "userRole": "RESPONDER",
    "messageType": "DEFAULT",
    "content": "Received, sending team",
    "timestamp": "2025-12-02T12:15:00"
  }
]
```

---

### Chat Users

#### 7. Add User to Group

Adds a user to a chat group. User details (full name and role) are automatically fetched from the User Service.

**Endpoint**: `POST /api/chat/{groupId}/users`

**Request Body**:

```json
{
  "userId": 3
}
```

**Response** (201 Created):

```json
{
  "chatGroupId": 1,
  "userId": 3,
  "userFullName": "John Doe",
  "userRole": "FIRE_DEPARTMENT",
  "lastReadMessageId": null
}
```

---

#### 8. Remove User from Group

Removes a user from a chat group.

**Endpoint**: `DELETE /api/chat/{groupId}/users/{userId}`

**Response** (204 No Content)

---

#### 9. Update Last Read Message

Marks messages as read up to a specific message ID. This is used to track unread message counts.

**Endpoint**: `PUT /api/chat/{groupId}/users/{userId}/read`

**Request Body**:

```json
{
  "messageId": 42
}
```

**Response** (204 No Content)

---

#### 10. Get Users in Group

Lists all users in a chat group.

**Endpoint**: `GET /api/chat/{groupId}/users`

**Response** (200 OK):

```json
[
  {
    "chatGroupId": 1,
    "userId": 1,
    "userFullName": "Jane Smith",
    "userRole": "COORDINATOR",
    "lastReadMessageId": 40
  },
  {
    "chatGroupId": 1,
    "userId": 2,
    "userFullName": "Mike Johnson",
    "userRole": "FIRE_DEPARTMENT",
    "lastReadMessageId": 42
  }
]
```

---

### Server-Sent Events (SSE)

#### 11. Subscribe to Live Messages

Establishes an SSE connection for real-time message updates.

**Endpoint**: `GET /api/chat/{groupId}/subscribe?userId={userId}`

**Response** (200 OK - Event Stream):

```
Content-Type: text/event-stream

data: {"chatMessageId":43,"chatGroupId":1,"userId":2,"content":"Update: Fire contained","timestamp":"2025-12-02T12:45:00"}

data: {"chatMessageId":44,"chatGroupId":1,"userId":1,"content":"Great work team","timestamp":"2025-12-02T12:46:00"}
```

**Client Example**:

```javascript
const eventSource = new EventSource(
  "http://localhost:8080/api/chat/1/subscribe?userId=2"
);

eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("New message:", message);
};

eventSource.onerror = (error) => {
  console.error("SSE error:", error);
  eventSource.close();
};
```

---

## Error Responses

### 400 Bad Request

Invalid request data or validation failure.

```json
{
  "status": 400,
  "message": "Validation failed",
  "timestamp": "2025-12-02T12:00:00",
  "errors": {
    "content": "must not be blank",
    "userId": "must not be null"
  }
}
```

### 404 Not Found

Resource not found.

```json
{
  "status": 404,
  "message": "Chat group not found with id: 999",
  "timestamp": "2025-12-02T12:00:00"
}
```

### 500 Internal Server Error

Unexpected server error.

```json
{
  "status": 500,
  "message": "An unexpected error occurred",
  "timestamp": "2025-12-02T12:00:00"
}
```

---

## Data Models

### ChatGroup

```typescript
{
  chatGroupId: number;
  incidentId: number;
  title: string;
  createdAt: string; // ISO 8601 timestamp
  isClosed: boolean;
}
```

### ChatMessage

```typescript
{
  chatMessageId: number;
  chatGroupId: number;
  userId: number;
  userFullName: string;
  userRole: string;
  messageType: "DEFAULT" | "LEADER" | "SYSTEM";
  content: string;
  timestamp: string; // ISO 8601 timestamp
}
```

### ChatUser

```typescript
{
  chatGroupId: number;
  userId: number;
  userFullName: string;
  userRole: string; // e.g., "COORDINATOR", "FIRE_DEPARTMENT"
  lastReadMessageId: number | null;
}
```

### ChatGroupListItem

```typescript
{
  chatGroupId: number;
  incidentId: number;
  title: string;
  createdAt: string;
  isClosed: boolean;
  unreadCount: number;
  lastMessage: ChatMessage | null;
}
```

---

## Integration Notes

### Service Discovery

The chat-service registers with Eureka Discovery Service and can be accessed via:

- Service name: `chat-service`
- Port: `8089`

### Dependencies

- **User Service**: Called via Feign client to fetch user details (name, role) using internal endpoint `/internal/{userId}`
- **PostgreSQL**: Database `chat_db` with tables:
  - `chat_groups`: Stores chat groups with unique constraint on `incident_id`
  - `chat_messages`: Stores messages with `message_type` enum (DEFAULT, LEADER, SYSTEM)
  - `chat_users`: Stores user membership and last read message tracking

### SSE Configuration

- Connection timeout: 30 minutes (configurable)
- Automatic reconnection recommended on client side
- API Gateway configured with special SSE route for proper streaming

---

## Swagger/OpenAPI

Interactive API documentation available at:

- `http://localhost:8089/swagger-ui.html` (when running locally or directly accessing the service)
