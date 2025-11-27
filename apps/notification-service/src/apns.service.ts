import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as apn from 'apn';

@Injectable()
export class ApnsService implements OnModuleInit {
    private readonly logger = new Logger(ApnsService.name);
    private provider: apn.Provider | null = null;

    onModuleInit() {
        if (process.env.APNS_KEY_PATH) {
            try {
                this.provider = new apn.Provider({
                    token: {
                        key: process.env.APNS_KEY_PATH,
                        keyId: process.env.APNS_KEY_ID || '',
                        teamId: process.env.APNS_TEAM_ID || '',
                    },
                    production: process.env.APNS_PRODUCTION === 'true',
                });
                this.logger.log('APNs initialized');
            } catch (error) {
                this.logger.warn('APNs initialization failed:', error);
            }
        } else {
            this.logger.warn('APNs not configured');
        }
    }

    async sendNotification(
        token: string,
        payload: { title: string; body: string; data?: any },
    ): Promise<void> {
        if (!this.provider) {
            this.logger.warn('APNs provider not initialized');
            return;
        }

        try {
            const notification = new apn.Notification();
            notification.alert = {
                title: payload.title,
                body: payload.body,
            };
            notification.sound = 'default';
            notification.badge = 1;
            notification.payload = payload.data || {};
            notification.topic = process.env.APNS_BUNDLE_ID || 'com.gearlink.app';

            const result = await this.provider.send(notification, token);

            if (result.failed.length > 0) {
                this.logger.error(`APNs send failed:`, result.failed);
            } else {
                this.logger.log(`APNs notification sent to ${token}`);
            }
        } catch (error) {
            this.logger.error(`APNs send failed:`, error);
            throw error;
        }
    }
}
