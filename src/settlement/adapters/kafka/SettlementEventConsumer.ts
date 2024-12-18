import { Inject, Injectable } from '@nestjs/common';
import { ISettlementService } from '../../domain/ports/out/ISettlementService';
import { Kafka } from 'kafkajs';
import { SettlementDto } from '../../domain/model/dto/SettlementDto';
import * as process from 'node:process';

@Injectable()
export class SettlementEventConsumer {
  private readonly kafka: Kafka;
  private clientId = 'settlement-service';

  constructor(
    @Inject(ISettlementService)
    private readonly settlementService: ISettlementService,
  ) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: [process.env.KAFKA_BROKER],
    });
    this.consumeMessages(process.env.SETTLEMENT_CREATED_TOPIC);
  }

  async consumeMessages(topic: string) {
    const consumer = this.kafka.consumer({ groupId: this.clientId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          topic,
          partition,
          value: message.value.toString(),
        });
        const settlementEvent: SettlementDto = JSON.parse(
          message.value.toString(),
        );
        await this.settlementService.handleSettlement(settlementEvent);
      },
    });
  }
}
