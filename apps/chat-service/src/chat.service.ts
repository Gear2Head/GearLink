import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient, MessageType } from '@gearlink/prisma';
import { CreateConversationDto, SendMessageDto } from '@gearlink/common';
import { RedisService } from './redis.service';
import { KafkaService } from './kafka.service';
import { MessageGateway } from './message.gateway';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaClient,
        private redis: RedisService,
        private kafka: KafkaService,
        private gateway: MessageGateway,
    ) { }

    async createConversation(userId: string, dto: CreateConversationDto) {
        // Logic to create conversation
        // For 1:1, check if exists
        if (dto.type === 'PRIVATE' && dto.participantIds.length === 1) {
            const otherId = dto.participantIds[0];
            // Check existing
            // ... (simplified for brevity)
        }

        const conversation = await this.prisma.conversation.create({
            data: {
                type: dto.type,
                name: dto.name,
                participants: {
                    create: [
                        { userId, role: 'ADMIN' },
                        ...dto.participantIds.map(id => ({ userId: id })),
                    ],
                },
            },
            include: { participants: true },
        });

        return conversation;
    }

    async getUserConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: {
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getMessages(userId: string, conversationId: string, limit = 50, before?: string) {
        // Verify participation
        const participant = await this.prisma.participant.findUnique({
            where: { conversationId_userId: { conversationId, userId } },
        });
        if (!participant) throw new ForbiddenException();

        return this.prisma.message.findMany({
            where: {
                conversationId,
                ...(before ? { createdAt: { lt: new Date(before) } } : {}),
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, displayName: true } },
                media: true,
            },
        });
    }

    async sendMessage(userId: string, dto: SendMessageDto) {
        // Get sequence number
        const sequenceNumber = await this.redis.incrSequence(dto.conversationId);

        const message = await this.prisma.message.create({
            data: {
                conversationId: dto.conversationId,
                senderId: userId,
                content: dto.content,
                type: dto.type as MessageType,
                tempId: dto.tempId,
                sequenceNumber: BigInt(sequenceNumber),
            },
            include: {
                sender: { select: { id: true, displayName: true, avatarUrl: true } },
            },
        });

        // Publish event
        await this.kafka.publishMessage('message.created', message);

        // Broadcast via WebSocket
        this.gateway.broadcastMessage(dto.conversationId, message);

        return message;
    }
}
