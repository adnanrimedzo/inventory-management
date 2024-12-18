import { Module } from '@nestjs/common';
import { IRevenueService } from './domain/ports/out/IRevenueService';
import { RevenueService } from './domain/service/RevenueService';
import { IRevenueRepository } from './domain/ports/in/IRevenueRepository';
import { RevenueRepository } from './adapters/database/RevenueRepositoryService';
import { ConfigModule } from '@nestjs/config';
import { RevenueEventConsumer } from './adapters/kafka/RevenueEventConsumerService';
import { RevenueInitService } from './domain/service/init/RevenueInitService';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    RevenueEventConsumer,
    RevenueInitService,
    { provide: IRevenueService, useClass: RevenueService },
    { provide: IRevenueRepository, useClass: RevenueRepository },
  ],
  exports: [IRevenueService],
})
export class RevenueModule {}
