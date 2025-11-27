import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, PushProvider } from '@gearlink/prisma';
import { FcmService } from './fcm.service';
import { ApnsService } from './apns.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private prisma: PrismaClient,
        private fcmService: FcmService,
        private apnsService: ApnsService,
    ) { }

    async registerPushToken(
        userId: string,
        dto: { deviceId: string; token: string; provider: 'FCM' | 'APNS' },
    ) {
        await this.prisma.device.updateMany({
            where: {
                userId,
                deviceId: dto.deviceId,
            },
            data: {
                pushToken: dto.token,
                pushProvider: dto.provider as PushProvider,
            },
        });

        return { success: true };
    }

    async sendMessageNotification(
        userId: string,
        payload: {
            title: string;
            body: string;
            conversationId: string;
            messageId: string;
        },
    ) {
        const devices = await this.prisma.device.findMany({
            where: {
                userId,
                pushToken: { not: null },
            },
        });

        const promises = devices.map(async (device) => {
            try {
                if (device.pushProvider === PushProvider.FCM) {
                    await this.fcmService.sendNotification(device.pushToken!, {
                        title: payload.title,
                        body: payload.body,
                        data: {
                            conversationId: payload.conversationId,
                            messageId: payload.messageId,
                            type: 'message',
                        },
                    });
                } else if (device.pushProvider === PushProvider.APNS) {
                    await this.apnsService.sendNotification(device.pushToken!, {
                        title: payload.title,
                        body: payload.body,
                        data: {
                            conversationId: payload.conversationId,
                            messageId: payload.messageId,
                            type: 'message',
                        },
                    });
                }
            } catch (error) {
                this.logger.error(`Failed to send notification to device ${device.id}:`, error);
            }
        });

        await Promise.allSettled(promises);
    }

    async sendTestNotification(userId: string) {
        await this.sendMessageNotification(userId, {
            title: 'Test Notification',
            body: 'This is a test notification from GearLink',
            conversationId: 'test',
            messageId: 'test',
        });

        return { success: true };
    }
}
