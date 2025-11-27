export const KAFKA_TOPICS = {
    MESSAGE_CREATED: 'message.created',
    MESSAGE_DELIVERED: 'message.delivered',
    MESSAGE_READ: 'message.read',
    USER_PRESENCE: 'user.presence',
    MEDIA_PROCESS: 'media.process',
    NOTIFICATION_SEND: 'notification.send',
} as const;

export const REDIS_KEYS = {
    USER_PRESENCE: (userId: string) => `presence:${userId}`,
    USER_DEVICES: (userId: string) => `devices:${userId}`,
    CONVERSATION_MEMBERS: (conversationId: string) => `conversation:${conversationId}:members`,
    MESSAGE_SEQUENCE: (conversationId: string) => `sequence:${conversationId}`,
    RATE_LIMIT: (userId: string, action: string) => `ratelimit:${userId}:${action}`,
} as const;

export const WS_EVENTS = {
    // Client -> Server
    MESSAGE_SEND: 'message:send',
    MESSAGE_ACK: 'message:ack',
    MESSAGE_READ: 'message:read',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    PRESENCE_UPDATE: 'presence:update',

    // Server -> Client
    MESSAGE_NEW: 'message:new',
    MESSAGE_DELIVERED: 'message:delivered',
    MESSAGE_READ_RECEIPT: 'message:read',
    TYPING_INDICATOR: 'typing',
    PRESENCE_CHANGED: 'presence:changed',
    ERROR: 'error',
} as const;
