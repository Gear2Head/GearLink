import { Injectable, Logger } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class SmsService {
    private client: Twilio.Twilio;
    private readonly logger = new Logger(SmsService.name);

    constructor() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.client = Twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN,
            );
        }
    }

    async sendVerificationCode(phoneNumber: string, code: string): Promise<void> {
        if (!this.client) {
            this.logger.warn(`Twilio not configured. Code for ${phoneNumber}: ${code}`);
            return;
        }

        try {
            await this.client.messages.create({
                body: `Your GearLink verification code is: ${code}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber,
            });
            this.logger.log(`SMS sent to ${phoneNumber}`);
        } catch (error) {
            this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
            // In dev mode, we don't want to block if Twilio fails
            if (process.env.NODE_ENV === 'production') {
                throw error;
            }
        }
    }
}
