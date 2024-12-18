import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { SettlementEventConsumer } from './adapters/kafka/SettlementEventConsumer';
import { ISettlementService } from './domain/ports/out/ISettlementService';
import { SettlementService } from './domain/service/SettlementService';
import { ISettlementRepository } from './domain/ports/in/ISettlementRepository';
import { SettlementRepository } from './adapters/database/SettlementRepository';
import { FxRateModule } from '../fx-rate/fx-rate.module';
import { SettlementPoller } from './adapters/poller/SettlementPoller';
import { LiquidityModule } from '../liquidity/liquidity.module';
import { RedisLockModule } from '@lostpfg/nestjs-redis-lock';
import { IRevenueEventProducer } from './domain/ports/in/IRevenueEventProducer';
import { RevenueModule } from '../revenue/revenue.module';
import { RevenueEventProducer } from './adapters/kafka/RevenueEventProducer';
import * as process from 'node:process';
import { ITransferCompletedEventProducer } from './domain/ports/in/ITransferCompletedEventProducer';
import { TransferCompletedEventProducer } from './adapters/kafka/TransferCompletedEventProducer';

@Module({
  imports: [
    FxRateModule,
    LiquidityModule,
    RevenueModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisLockModule.forRoot({
      redis: [
        {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT),
        },
      ],
    }),
  ],
  providers: [
    SettlementEventConsumer,
    SettlementPoller,
    { provide: ISettlementService, useClass: SettlementService },
    { provide: ISettlementRepository, useClass: SettlementRepository },
    { provide: IRevenueEventProducer, useClass: RevenueEventProducer },
    {
      provide: ITransferCompletedEventProducer,
      useClass: TransferCompletedEventProducer,
    },
  ],
})
export class SettlementModule {}
