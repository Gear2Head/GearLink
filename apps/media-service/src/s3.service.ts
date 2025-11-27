import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service implements OnModuleInit {
    private s3Client: S3Client;
    private bucket: string;

    onModuleInit() {
        this.bucket = process.env.S3_BUCKET || 'gearlink-media';

        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    async getPresignedUploadUrl(
        key: string,
        contentType: string,
        expiresIn: number = 300,
    ): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async getPresignedDownloadUrl(
        key: string,
        expiresIn: number = 3600,
    ): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    async fileExists(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        } catch {
            return false;
        }
    }

    async getFileMetadata(key: string) {
        const command = new HeadObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return this.s3Client.send(command);
    }
}
