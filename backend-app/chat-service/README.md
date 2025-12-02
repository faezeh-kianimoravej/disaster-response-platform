# Chat Service API Documentation

This document provides comprehensive API documentation for the Chat Service microservice.

## Base URL

- **Local (Single)**: `http://localhost:8089`
- **Local (Docker)**: `http://chat-service:8089`
- **Production**: Via API Gateway at `http://localhost:8080/api/chat`

## Authentication

All endpoints require valid authentication tokens passed via the API Gateway.

---

## Endpoints

### Chat Groups

#### 1. Create Chat Group

Creates a new chat group for an incident.

**Endpoint**: `POST /api/chat/groups`

**Request Body**:

```json
{
  "incidentId": 1,
  "title": "Emergency Response - Fire"
}
```

**Response** (201 Created):

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

Sends a new message to a chat group.

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
    "content": "Emergency at Main Street",
    "timestamp": "2025-12-02T12:00:00"
  },
  {
    "chatMessageId": 41,
    "chatGroupId": 1,
    "userId": 2,
    "content": "Received, sending team",
    "timestamp": "2025-12-02T12:15:00"
  }
]
```

---

### Chat Users

#### 7. Add User to Group

Adds a user to a chat group.

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

Marks messages as read up to a specific message ID.

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

- **User Service**: Called via Feign client to fetch user details (name, role)
- **PostgreSQL**: Database `chat_db` with tables `chat_groups`, `chat_messages`, `chat_users`

### SSE Configuration

- Connection timeout: 30 minutes (configurable)
- Automatic reconnection recommended on client side
- API Gateway configured with special SSE route for proper streaming

---

## Swagger/OpenAPI

Interactive API documentation available at:

- `http://localhost:8089/swagger-ui.html` (when running locally or directly accessing the service)
