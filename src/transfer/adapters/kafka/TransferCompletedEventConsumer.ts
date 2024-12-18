import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import * as process from 'node:process';
import { ITransferService } from '../../domain/ports/out/ITransferService';
import { TransferStatus } from '../../domain/model/dto/TransferStatus';

@Injectable()
export class TransferCompletedEventConsumer {
  private readonly kafka: Kafka;
  private clientId = 'transfer-service';

  constructor(
    @Inject(ITransferService)
    private readonly transferService: ITransferService,
  ) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: [process.env.KAFKA_BROKER],
    });
    this.consumeMessages(process.env.TRANSFER_COMPLETED_TOPIC);
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
        const transferId: number = JSON.parse(message.value.toString());
        await this.transferService.updateTransferStatus(
          transferId,
          TransferStatus.COMPLETED,
        );
      },
    });
  }
}
