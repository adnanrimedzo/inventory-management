import { Injectable } from '@nestjs/common';
import { ISettlementEventProducer } from '../../domain/ports/in/ISettlementEventProducer';
import { Kafka } from 'kafkajs';
import { SettlementDto } from '../../../settlement/domain/model/dto/SettlementDto';
import * as process from 'node:process';

@Injectable()
export class SettlementEventProducer implements ISettlementEventProducer {
  private readonly kafka: Kafka;
  private readonly clientId = 'transfer-service';

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

  async publishSettlementEvent(settlementEvent: SettlementDto) {
    await this.sendMessage(
      process.env.SETTLEMENT_CREATED_TOPIC,
      JSON.stringify(settlementEvent),
    );
  }
}
