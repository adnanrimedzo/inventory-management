import { Injectable } from '@nestjs/common';
import { IRevenueEventProducer } from '../../domain/ports/in/IRevenueEventProducer';
import { Kafka } from 'kafkajs';
import { RevenueDto } from '../../../revenue/domain/model/dto/RevenueDto';
import * as process from 'node:process';

@Injectable()
export class RevenueEventProducer implements IRevenueEventProducer {
  private readonly kafka: Kafka;
  private clientId = 'settlement-service';

  constructor() {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: [process.env.KAFKA_BROKER],
    });
  }

  private async sendMessage(topic: string, message: string) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
    await producer.disconnect();
  }

  async publishRevenueEvent(revenueDto: RevenueDto) {
    await this.sendMessage(
      process.env.REVENUE_CREATED_TOPIC,
      JSON.stringify(revenueDto),
    );
  }
}
