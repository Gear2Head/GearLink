import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
    private readonly logger = new Logger(FcmService.name);

    onModuleInit() {
        if (process.env.FCM_SERVER_KEY) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FCM_PROJECT_ID,
                        privateKey: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                        clientEmail: process.env.FCM_CLIENT_EMAIL,
                    }),
                });
                this.logger.log('FCM initialized');
            } catch (error) {
                this.logger.warn('FCM initialization failed:', error);
            }
        } else {
            this.logger.warn('FCM not configured');
        }
    }

    async sendNotification(
        token: string,
        payload: { title: string; body: string; data?: any },
    ): Promise<void> {
        try {
            await admin.messaging().send({
                token,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data || {},
                android: {
                    priority: 'high',
                },
            });
            this.logger.log(`FCM notification sent to ${token}`);
        } catch (error) {
            this.logger.error(`FCM send failed:`, error);
            throw error;
        }
    }
}
