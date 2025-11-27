import { PrismaClient, MediaType } from '@gearlink/prisma';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, createReadStream, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export class MediaProcessor {
    private s3Client: S3Client;
    private bucket: string;

    constructor(private prisma: PrismaClient) {
        this.bucket = process.env.S3_BUCKET || 'gearlink-media';

        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async processMedia(payload: { mediaId: string; s3Key: string; type: MediaType }) {
        const media = await this.prisma.messageMedia.findUnique({
            where: { id: payload.mediaId },
        });

        if (!media) {
            throw new Error('Media not found');
        }

        try {
            switch (media.type) {
                case MediaType.IMAGE:
                    await this.processImage(media);
                    break;
                case MediaType.VIDEO:
                    await this.processVideo(media);
                    break;
                case MediaType.AUDIO:
                    await this.processAudio(media);
                    break;
                default:
                    console.log(`No processing needed for type: ${media.type}`);
            }

            await this.prisma.messageMedia.update({
                where: { id: media.id },
                data: {
                    isProcessed: true,
                    isScanned: true,
                    scanResult: 'clean',
                },
            });
        } catch (error) {
            console.error('Processing error:', error);

            await this.prisma.messageMedia.update({
                where: { id: media.id },
                data: {
                    isProcessed: false,
                    processingError: (error as Error).message,
                },
            });
        }
    }

    private async processImage(media: any) {
        // Download from S3
        const tempPath = join(tmpdir(), `${media.id}-original`);
        const thumbnailPath = join(tmpdir(), `${media.id}-thumb.jpg`);

        await this.downloadFromS3(media.s3Key, tempPath);

        // Get image metadata
        const metadata = await sharp(tempPath).metadata();

        // Generate thumbnail
        await sharp(tempPath)
            .resize(300, 300, { fit: 'inside' })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        // Upload thumbnail to S3
        const thumbnailKey = media.s3Key.replace(/\.[^.]+$/, '-thumb.jpg');
        await this.uploadToS3(thumbnailPath, thumbnailKey, 'image/jpeg');

        // Update database
        await this.prisma.messageMedia.update({
            where: { id: media.id },
            data: {
                width: metadata.width,
                height: metadata.height,
                thumbnailS3Key: thumbnailKey,
                thumbnailUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${thumbnailKey}`,
                cdnUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${media.s3Key}`,
            },
        });

        // Cleanup
        unlinkSync(tempPath);
        unlinkSync(thumbnailPath);
    }

    private async processVideo(media: any) {
        const tempPath = join(tmpdir(), `${media.id}-original`);
        const posterPath = join(tmpdir(), `${media.id}-poster.jpg`);

        await this.downloadFromS3(media.s3Key, tempPath);

        // Get video metadata and generate poster
        await new Promise<void>((resolve, reject) => {
            ffmpeg(tempPath)
                .screenshots({
                    timestamps: ['00:00:01'],
                    filename: `${media.id}-poster.jpg`,
                    folder: tmpdir(),
                    size: '640x?',
                })
                .on('end', () => resolve())
                .on('error', (err) => reject(err));
        });

        // Upload poster to S3
        const posterKey = media.s3Key.replace(/\.[^.]+$/, '-poster.jpg');
        await this.uploadToS3(posterPath, posterKey, 'image/jpeg');

        // Get video duration
        const duration = await this.getVideoDuration(tempPath);

        // Update database
        await this.prisma.messageMedia.update({
            where: { id: media.id },
            data: {
                duration,
                thumbnailS3Key: posterKey,
                thumbnailUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${posterKey}`,
                cdnUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${media.s3Key}`,
            },
        });

        // Cleanup
        unlinkSync(tempPath);
        unlinkSync(posterPath);
    }

    private async processAudio(media: any) {
        const tempPath = join(tmpdir(), `${media.id}-original`);
        await this.downloadFromS3(media.s3Key, tempPath);

        // Get audio duration
        const duration = await this.getAudioDuration(tempPath);

        // Update database
        await this.prisma.messageMedia.update({
            where: { id: media.id },
            data: {
                duration,
                cdnUrl: `https://${process.env.CLOUDFRONT_DOMAIN}/${media.s3Key}`,
            },
        });

        unlinkSync(tempPath);
    }

    private async downloadFromS3(key: string, destPath: string): Promise<void> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        const response = await this.s3Client.send(command);
        const stream = response.Body as any;
        const writeStream = createWriteStream(destPath);

        return new Promise((resolve, reject) => {
            stream.pipe(writeStream);
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    }

    private async uploadToS3(filePath: string, key: string, contentType: string): Promise<void> {
        const fileStream = createReadStream(filePath);

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
        });

        await this.s3Client.send(command);
    }

    private getVideoDuration(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) reject(err);
                else resolve(Math.floor(metadata.format.duration || 0));
            });
        });
    }

    private getAudioDuration(filePath: string): Promise<number> {
        return this.getVideoDuration(filePath);
    }
}
