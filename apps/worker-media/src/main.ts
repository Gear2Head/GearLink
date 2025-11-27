import { Kafka, Consumer } from 'kafkajs';
import { PrismaClient } from '@gearlink/prisma';
import { MediaProcessor } from './media-processor';

class MediaWorker {
    private kafka: Kafka;
    private consumer: Consumer;
    private prisma: PrismaClient;
    private processor: MediaProcessor;

    constructor() {
        this.kafka = new Kafka({
            clientId: 'gearlink-media-worker',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });

        this.consumer = this.kafka.consumer({
            groupId: 'media-worker',
        });

        this.prisma = new PrismaClient();
        this.processor = new MediaProcessor(this.prisma);
    }

    async start() {
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: 'media.process', fromBeginning: false });

        console.log('🎬 Media Worker started');

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const payload = JSON.parse(message.value?.toString() || '{}');
                    console.log(`Processing media: ${payload.mediaId}`);

                    await this.processor.processMedia(payload);

                    console.log(`Completed processing: ${payload.mediaId}`);
                } catch (error) {
                    console.error('Error processing media:', error);
                }
            },
        });
    }
}

const worker = new MediaWorker();
worker.start().catch(console.error);
