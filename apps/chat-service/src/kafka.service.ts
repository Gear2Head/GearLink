import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
    private kafka: Kafka;
    private producer: Producer;

    async onModuleInit() {
        this.kafka = new Kafka({
            clientId: 'gearlink-chat',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });

        this.producer = this.kafka.producer();
        await this.producer.connect();
    }

    async publishMessage(topic: string, message: any) {
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
    }
}
