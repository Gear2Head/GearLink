import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, MediaType } from '@gearlink/prisma';
import { S3Service } from './s3.service';
import { KafkaService } from './kafka.service';
import { randomBytes } from 'crypto';

@Injectable()
export class MediaService {
    constructor(
        private prisma: PrismaClient,
        private s3Service: S3Service,
        private kafka: KafkaService,
    ) { }

    async generatePresignedUrl(
        userId: string,
        dto: { fileName: string; mimeType: string; fileSize: number },
    ) {
        // Generate unique S3 key
        const timestamp = Date.now();
        const random = randomBytes(8).toString('hex');
        const extension = dto.fileName.split('.').pop();
        const s3Key = `uploads/${userId}/${timestamp}-${random}.${extension}`;

        // Generate presigned URL for upload
        const presignedUrl = await this.s3Service.getPresignedUploadUrl(
            s3Key,
            dto.mimeType,
            300, // 5 minutes expiry
        );

        return {
            uploadUrl: presignedUrl,
            s3Key,
            expiresIn: 300,
        };
    }

    async confirmUpload(
        userId: string,
        dto: { s3Key: string; messageId: string },
    ) {
        // Verify file exists in S3
        const exists = await this.s3Service.fileExists(dto.s3Key);
        if (!exists) {
            throw new NotFoundException('File not found in S3');
        }

        // Get file metadata
        const metadata = await this.s3Service.getFileMetadata(dto.s3Key);

        // Determine media type
        const mimeType = metadata.ContentType || 'application/octet-stream';
        const mediaType = this.getMediaType(mimeType);

        // Create media record
        const media = await this.prisma.messageMedia.create({
            data: {
                messageId: dto.messageId,
                type: mediaType,
                s3Key: dto.s3Key,
                s3Bucket: process.env.S3_BUCKET || 'gearlink-media',
                mimeType,
                fileSize: BigInt(metadata.ContentLength || 0),
                isProcessed: false,
            },
        });

        // Publish to Kafka for processing
        await this.kafka.publishMessage('media.process', {
            mediaId: media.id,
            s3Key: dto.s3Key,
            type: mediaType,
        });

        return media;
    }

    async getMediaById(id: string) {
        const media = await this.prisma.messageMedia.findUnique({
            where: { id },
        });

        if (!media) {
            throw new NotFoundException('Media not found');
        }

        // Generate CDN URL or presigned download URL
        const cdnUrl = media.cdnUrl || await this.s3Service.getPresignedDownloadUrl(media.s3Key, 3600);

        return {
            ...media,
            url: cdnUrl,
        };
    }

    private getMediaType(mimeType: string): MediaType {
        if (mimeType.startsWith('image/')) return MediaType.IMAGE;
        if (mimeType.startsWith('video/')) return MediaType.VIDEO;
        if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
        return MediaType.DOCUMENT;
    }
}
