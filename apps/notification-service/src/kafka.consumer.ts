import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { NotificationService } from './notification.service';

@Injectable()
export class KafkaConsumer implements OnModuleInit {
    private kafka: Kafka;
    private consumer: Consumer;
    private readonly logger = new Logger(KafkaConsumer.name);

    constructor(private notificationService: NotificationService) { }

    async onModuleInit() {
        this.kafka = new Kafka({
            clientId: 'gearlink-notification',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });

        this.consumer = this.kafka.consumer({
            groupId: 'notification-service',
        });

        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'message.created', fromBeginning: false });

        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const payload = JSON.parse(message.value?.toString() || '{}');
                    await this.handleMessageCreated(payload);
                } catch (error) {
                    this.logger.error('Error processing message:', error);
                }
            },
        });

        this.logger.log('Kafka consumer started');
    }

    private async handleMessageCreated(payload: any) {
        // Send notification to all participants except sender
        const participants = await this.getConversationParticipants(payload.conversationId);

        for (const participant of participants) {
            if (participant.userId !== payload.senderId) {
                await this.notificationService.sendMessageNotification(participant.userId, {
                    title: payload.sender?.displayName || 'New Message',
                    body: this.getNotificationBody(payload),
                    conversationId: payload.conversationId,
                    messageId: payload.id,
                });
            }
        }
    }

    private async getConversationParticipants(conversationId: string) {
        // This would normally query the database
        // For now, returning empty array
        return [];
    }

    private getNotificationBody(payload: any): string {
        switch (payload.type) {
            case 'TEXT':
                return payload.content.substring(0, 100);
            case 'IMAGE':
                return '📷 Image';
            case 'VIDEO':
                return '🎥 Video';
            case 'AUDIO':
                return '🎵 Audio';
            case 'VOICE':
                return '🎤 Voice message';
            default:
                return 'New message';
        }
    }
}
