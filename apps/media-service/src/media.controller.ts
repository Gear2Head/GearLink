import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard, CurrentUserId } from '@gearlink/common';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    @Post('presign')
    async getPresignedUrl(
        @CurrentUserId() userId: string,
        @Body() dto: { fileName: string; mimeType: string; fileSize: number },
    ) {
        return this.mediaService.generatePresignedUrl(userId, dto);
    }

    @Post('confirm')
    async confirmUpload(
        @CurrentUserId() userId: string,
        @Body() dto: { s3Key: string; messageId: string },
    ) {
        return this.mediaService.confirmUpload(userId, dto);
    }

    @Get(':id')
    async getMedia(@Param('id') id: string) {
        return this.mediaService.getMediaById(id);
    }
}
