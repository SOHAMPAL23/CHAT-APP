# 🏗️ Chat App Architecture & Flow Diagrams

## System Architecture

```mermaid
graph TB
    subgraph Frontend
        A[React App]
        B[Zustand Stores]
        C[Socket.io Client]
        D[Axios API Client]
    end
    
    subgraph Backend
        E[Express Server]
        F[Socket.io Server]
        G[JWT Middleware]
        H[Controllers]
    end
    
    subgraph Database
        I[MongoDB]
        J[User Collection]
        K[Message Collection]
    end
    
    subgraph Email
        L[Nodemailer]
        M[Gmail SMTP]
    end
    
    A --> B
    A --> C
    A --> D
    C --> F
    D --> E
    E --> G
    G --> H
    H --> I
    H --> L
    L --> M
    I --> J
    I --> K
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant E as Email
    
    Note over U,E: Login Flow
    U->>F: Enter credentials
    F->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User data
    B->>B: Compare password hash
    B->>B: Generate JWT token
    B-->>F: { token, user }
    F->>F: Store in localStorage
    F-->>U: Redirect to chat
    
    Note over U,E: Password Reset Flow
    U->>F: Click "Forgot password"
    F->>B: POST /api/auth/forgot-password
    B->>B: Generate reset token
    B->>DB: Save hashed token + expiry
    B->>E: Send email with link
    E-->>U: Reset email
    U->>F: Click link → /reset-password/:token
    F->>B: POST /api/auth/reset-password/:token
    B->>DB: Verify token not expired
    B->>DB: Update password
    B-->>F: { token, user }
    F-->>U: Auto-login + redirect
```

---

## Real-Time Messaging Flow

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant F1 as Frontend 1
    participant S as Socket.io Server
    participant F2 as Frontend 2
    participant U2 as User 2
    participant DB as MongoDB
    
    Note over U1,DB: Send Message
    U1->>F1: Type & send message
    F1->>S: emit('sendMessage', data)
    S->>DB: Create message
    DB-->>S: Message saved
    S->>F1: emit('messageSent', message)
    S->>F2: emit('receiveMessage', message)
    F1-->>U1: Show message (sent)
    F2-->>U2: Show message (received)
    
    Note over U1,DB: Typing Indicator
    U1->>F1: Start typing
    F1->>S: emit('typing', { receiverId, isTyping: true })
    S->>F2: emit('userTyping', { userId, isTyping: true })
    F2-->>U2: Show "User 1 is typing..."
    U1->>F1: Stop typing
    F1->>S: emit('typing', { receiverId, isTyping: false })
    S->>F2: emit('userTyping', { userId, isTyping: false })
    F2-->>U2: Hide typing indicator
```

---

## Message Reactions Flow

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant F1 as Frontend 1
    participant S as Socket.io Server
    participant F2 as Frontend 2
    participant U2 as User 2
    participant DB as MongoDB
    
    Note over U1,DB: Add Reaction
    U1->>F1: Click reaction emoji
    F1->>S: emit('addReaction', { messageId, emoji })
    S->>DB: Find message
    S->>DB: Add/update reaction
    DB-->>S: Updated message
    S->>F1: emit('reactionAdded', { messageId, reactions })
    S->>F2: emit('reactionAdded', { messageId, reactions })
    F1-->>U1: Update message UI
    F2-->>U2: Update message UI
    
    Note over U1,DB: Remove Reaction
    U1->>F1: Click to remove reaction
    F1->>S: emit('removeReaction', { messageId })
    S->>DB: Remove user's reaction
    DB-->>S: Updated message
    S->>F1: emit('reactionRemoved', { messageId, reactions })
    S->>F2: emit('reactionRemoved', { messageId, reactions })
    F1-->>U1: Update message UI
    F2-->>U2: Update message UI
```

---

## Online/Offline Status Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Socket.io Server
    participant DB as MongoDB
    participant All as All Connected Clients
    
    Note over U,All: User Connects
    U->>F: Open app
    F->>S: connect(token)
    S->>S: Verify JWT token
    S->>DB: Update isOnline = true
    S->>All: emit('userStatusChange', { userId, isOnline: true })
    All-->>All: Show green indicator
    
    Note over U,All: User Disconnects
    U->>F: Close app / network loss
    F->>S: disconnect
    S->>DB: Update isOnline = false, lastSeen = now
    S->>All: emit('userStatusChange', { userId, isOnline: false })
    All-->>All: Show gray indicator + last seen
```

---

## Email Service Flow

```mermaid
graph LR
    A[User Action] --> B{Email Type}
    B -->|New User| C[Welcome Email]
    B -->|Forgot Password| D[Reset Email]
    
    C --> E[Nodemailer]
    D --> E
    
    E --> F[Gmail SMTP]
    F --> G[User's Inbox]
    
    D --> H[Generate Token]
    H --> I[Hash Token]
    I --> J[Save to DB]
    J --> K[Include in Email Link]
    K --> E
    
    G --> L[User Clicks Link]
    L --> M[Frontend: /reset-password/:token]
    M --> N[Backend: Verify & Reset]
```

---

## Database Schema Relationships

```mermaid
erDiagram
    User ||--o{ Message : sends
    User ||--o{ Message : receives
    User ||--o{ Reaction : creates
    Message ||--o{ Reaction : has
    
    User {
        ObjectId _id
        String username
        String email
        String password
        String profilePicture
        Boolean isOnline
        Date lastSeen
        String resetPasswordToken
        Date resetPasswordExpires
        String refreshToken
    }
    
    Message {
        ObjectId _id
        ObjectId senderId
        ObjectId receiverId
        String messageText
        String fileUrl
        String fileName
        String fileType
        Array reactions
        Boolean isRead
        Date readAt
        Date createdAt
    }
    
    Reaction {
        ObjectId userId
        String emoji
        Date createdAt
    }
```

---

## Frontend Component Tree

```
App
├── App.css (Global Styles)
├── Routes
│   ├── / (Protected)
│   │   └── HomePage
│   │       ├── Sidebar
│   │       │   ├── User List
│   │       │   ├── Search
│   │       │   └── Profile Button
│   │       └── Chat Area
│   │           ├── Chat Header
│   │           ├── Messages
│   │           │   ├── Message Bubble
│   │           │   ├── Reactions
│   │           │   └── Timestamp
│   │           ├── Typing Indicator
│   │           └── Message Input
│   ├── /login
│   │   └── LoginPage (Animated)
│   ├── /signup
│   │   └── SignupPage (Animated)
│   ├── /forgot-password
│   │   └── ForgotPasswordPage
│   ├── /reset-password/:token
│   │   └── ResetPasswordPage
│   └── /profile
│       └── ProfilePage
└── Zustand Stores
    ├── authStore (user, token, login, logout)
    ├── chatStore (messages, users, selectedUser)
    └── socketStore (socket, connect, emit, listen)
```

---

## API Request Flow

```mermaid
graph TD
    A[Frontend Action] --> B[Axios Request]
    B --> C{Has Token?}
    C -->|Yes| D[Add Authorization Header]
    C -->|No| E[Send without Header]
    D --> F[API Endpoint]
    E --> F
    
    F --> G{Protected Route?}
    G -->|Yes| H[JWT Middleware]
    G -->|No| I[Controller]
    
    H --> J{Valid Token?}
    J -->|Yes| K[Attach user to req]
    J -->|No| L[Return 401 Unauthorized]
    
    K --> I
    I --> M[Database Operation]
    M --> N[Return Response]
    
    L --> O[Frontend Interceptor]
    O --> P[Clear localStorage]
    P --> Q[Redirect to /login]
    
    N --> R[Frontend Receives Data]
    R --> S[Update UI]
```

---

## Socket.io Event Flow

```mermaid
graph LR
    subgraph Client
        A[User Action]
        B[Emit Event]
        C[Listen for Response]
        D[Update UI]
    end
    
    subgraph Server
        E[Receive Event]
        F[Authenticate]
        G[Process]
        H[Update Database]
        I[Emit to Target]
        J[Broadcast]
    end
    
    A --> B
    B --> E
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    I --> C
    J --> C
    C --> D
```

**Events Map:**
- `connection` → User connects
- `disconnect` → User disconnects
- `sendMessage` → Send chat message
- `receiveMessage` → Receive chat message
- `typing` → User typing status
- `userTyping` → Broadcast typing
- `markAsRead` → Mark messages read
- `messagesRead` → Notify sender
- `addReaction` → Add emoji reaction
- `reactionAdded` → Broadcast reaction
- `removeReaction` → Remove reaction
- `reactionRemoved` → Broadcast removal
- `userStatusChange` → Online/offline update
- `onlineUsers` → List of online users

---

## Security Flow

```mermaid
graph TB
    subgraph Password Reset Security
        A[User requests reset]
        B[Generate random token - crypto]
        C[Hash token - SHA256]
        D[Save hash to DB]
        E[Send plain token via email]
        F[User clicks link]
        G[Hash received token]
        H[Compare with DB hash]
        I{Match & Not Expired?}
        I -->|Yes| J[Allow password reset]
        I -->|No| K[Reject - Invalid/Expired]
    end
    
    subgraph JWT Security
        L[User logs in]
        M[Verify password - bcrypt]
        N[Generate JWT - jsonwebtoken]
        O[Sign with secret]
        P[Return to client]
        Q[Client stores token]
        R[Include in requests]
        S[Server verifies signature]
        T{Valid?}
        T -->|Yes| U[Grant access]
        T -->|No| V[Reject - 401]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    
    L --> M
    M --> N
    N --> O
    O --> P
    P --> Q
    Q --> R
    R --> S
    S --> T
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Users
        A[Web Browser]
        B[Mobile Browser]
    end
    
    subgraph Frontend - Vercel
        C[React App]
        D[Static Assets]
        E[CDN]
    end
    
    subgraph Backend - Render
        F[Node.js Server]
        G[Express API]
        H[Socket.io Server]
    end
    
    subgraph Database
        I[MongoDB Atlas]
    end
    
    subgraph Email
        J[Gmail SMTP]
    end
    
    A --> E
    B --> E
    E --> C
    C --> D
    
    C --> G
    C --> H
    
    G --> F
    H --> F
    
    F --> I
    F --> J
```

---

## Feature Dependencies

```mermaid
graph TD
    A[Core App] --> B[Authentication]
    B --> C[JWT Tokens]
    B --> D[Password Hashing]
    B --> E[Email Service]
    
    E --> F[Forgot Password]
    E --> G[Welcome Emails]
    
    A --> H[Real-Time Chat]
    H --> I[Socket.io]
    H --> J[Online Status]
    H --> K[Typing Indicators]
    H --> L[Message Reactions]
    
    I --> J
    I --> K
    I --> L
    
    A --> M[Database]
    M --> N[User Model]
    M --> O[Message Model]
    
    O --> L
    N --> B
    
    A --> P[UI/UX]
    P --> Q[Animations]
    P --> R[Responsive Design]
    P --> S[Pure CSS]
```

---

## State Management Flow

```mermaid
graph LR
    subgraph authStore
        A1[user]
        A2[token]
        A3[login]
        A4[logout]
        A5[signup]
    end
    
    subgraph chatStore
        B1[messages]
        B2[users]
        B3[selectedUser]
        B4[getMessages]
        B5[sendMessage]
    end
    
    subgraph socketStore
        C1[socket]
        C2[typingUsers]
        C3[onlineUsers]
        C4[initializeSocket]
        C5[emit events]
    end
    
    A3 --> A1
    A3 --> A2
    A4 --> A1
    A4 --> A2
    
    A2 --> C4
    C4 --> C1
    
    C1 --> C5
    C5 --> B1
    
    B4 --> B1
    B5 --> C5
```

---

## Animation Timeline

```mermaid
gantt
    title Login Page Animation Sequence
    dateFormat X
    axisFormat %Ls
    
    section Background
    Gradient Shift     :0, 15000
    Float Particles    :0, 20000
    
    section Page Load
    Slide In Up        :0, 600
    Icon Pulse         :200, 2000
    Title Fade Down    :200, 800
    Subtitle Fade Down :300, 800
    Form Fade Up       :400, 800
    Footer Fade In     :600, 1000
    
    section Interactive
    Input Focus        :active, 0, 300
    Button Hover       :active, 0, 300
    Ripple Effect      :active, 0, 600
```

---

## Error Handling Flow

```mermaid
graph TD
    A[User Action] --> B[API Request]
    B --> C{Success?}
    
    C -->|Yes| D[Update State]
    D --> E[Show Success Toast]
    E --> F[Update UI]
    
    C -->|No| G{Error Type}
    
    G -->|401| H[Unauthorized]
    H --> I[Clear localStorage]
    I --> J[Redirect to Login]
    J --> K[Show Error Toast]
    
    G -->|400| L[Validation Error]
    L --> M[Show Field Errors]
    M --> K
    
    G -->|500| N[Server Error]
    N --> O[Log to Console]
    O --> K
    
    G -->|Network| P[Connection Error]
    P --> Q[Retry Logic]
    Q --> K
    
    K --> R[User Feedback]
```

---

This architecture documentation provides a comprehensive visual overview of how all the features work together in the Chat App!
