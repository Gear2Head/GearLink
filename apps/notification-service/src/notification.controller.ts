import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard, CurrentUserId } from '@gearlink/common';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('register-token')
    async registerPushToken(
        @CurrentUserId() userId: string,
        @Body() dto: { deviceId: string; token: string; provider: 'FCM' | 'APNS' },
    ) {
        return this.notificationService.registerPushToken(userId, dto);
    }

    @Post('test')
    async sendTestNotification(@CurrentUserId() userId: string) {
        return this.notificationService.sendTestNotification(userId);
    }
}
