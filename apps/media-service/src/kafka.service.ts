import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
    private kafka: Kafka;
    private producer: Producer;
    private readonly logger = new Logger(KafkaService.name);

    async onModuleInit() {
        this.kafka = new Kafka({
            clientId: process.env.KAFKA_CLIENT_ID || 'gearlink-media',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });

        this.producer = this.kafka.producer();
        await this.producer.connect();
        this.logger.log('Kafka producer connected');
    }

    async publishMessage(topic: string, message: any): Promise<void> {
        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: message.mediaId || message.id,
                        value: JSON.stringify(message),
                    },
                ],
            });
        } catch (error) {
            this.logger.error(`Failed to publish to ${topic}:`, error);
        }
    }
}
