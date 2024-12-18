import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import * as process from 'node:process';
import { ITransferCompletedEventProducer } from '../../domain/ports/in/ITransferCompletedEventProducer';

@Injectable()
export class TransferCompletedEventProducer
  implements ITransferCompletedEventProducer
{
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

  async publishTransferCompletedEvent(transferId: number) {
    await this.sendMessage(
      process.env.TRANSFER_COMPLETED_TOPIC,
      JSON.stringify(transferId),
    );
  }
}
