import { Module } from '@nestjs/common';
import { TransferController } from './adapters/api/controller/TransferController';
import { TransferService } from './domain/service/TransferService';
import { ITransferService } from './domain/ports/out/ITransferService';
import { ITransferRepository } from './domain/ports/in/ITransferRepository';
import { TransferRepository } from './adapters/database/TransferRepository';
import { FxRateModule } from '../fx-rate/fx-rate.module';
import { SettlementEventProducer } from './adapters/kafka/SettlementEventProducer';
import { ISettlementEventProducer } from './domain/ports/in/ISettlementEventProducer';
import { SettlementModule } from '../settlement/settlement.module';
import { LiquidityModule } from '../liquidity/liquidity.module';
import { TransferCompletedEventConsumer } from './adapters/kafka/TransferCompletedEventConsumer';

@Module({
  imports: [FxRateModule, SettlementModule, LiquidityModule],
  controllers: [TransferController],
  providers: [
    TransferCompletedEventConsumer,
    { provide: ITransferService, useClass: TransferService },
    { provide: ITransferRepository, useClass: TransferRepository },
    { provide: ISettlementEventProducer, useClass: SettlementEventProducer },
  ],
})
export class TransferModule {}
