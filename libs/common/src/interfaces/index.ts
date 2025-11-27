export interface JwtPayload {
    sub: string; // User ID
    deviceId: string;
    iat?: number;
    exp?: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface UserProfile {
    id: string;
    phoneNumber: string;
    username?: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    lastSeenAt: Date;
}

export interface MessagePayload {
    id: string;
    conversationId: string;
    senderId: string;
    type: string;
    content: string;
    tempId?: string;
    replyToId?: string;
    sequenceNumber: bigint;
    createdAt: Date;
}

export interface DeliveryUpdate {
    messageId: string;
    userId: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
    timestamp: Date;
}
