import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { RevenueDto } from '../../domain/model/dto/RevenueDto';
import { IRevenueService } from '../../domain/ports/out/IRevenueService';
import * as process from 'node:process';

@Injectable()
export class RevenueEventConsumer {
  private readonly kafka: Kafka;
  private readonly groupId = 'revenue-service';

  constructor(
    @Inject(IRevenueService)
    private readonly revenueService: IRevenueService,
  ) {
    this.kafka = new Kafka({
      clientId: this.groupId,
      brokers: [process.env.KAFKA_BROKER],
    });
    this.consumeMessages(process.env.REVENUE_CREATED_TOPIC);
  }

  async consumeMessages(topic: string) {
    const consumer = this.kafka.consumer({ groupId: this.groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          topic,
          partition,
          value: message.value.toString(),
        });
        const revenueDto: RevenueDto = JSON.parse(message.value.toString());
        await this.revenueService.handleRevenue(revenueDto);
      },
    });
  }
}
