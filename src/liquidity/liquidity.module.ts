import { Module } from '@nestjs/common';
import { ILiquidityService } from './domain/ports/out/ILiquidityService';
import { LiquidityService } from './domain/service/LiquidityService';
import { ILiquidityRepository } from './domain/ports/in/ILiquidityRepository';
import { LiquidityRepository } from './adapters/database/LiquidityRepositoryService';
import { ConfigModule } from '@nestjs/config';
import { LiquidityInitService } from './domain/service/init/LiquidityInitService';
import { FxRateModule } from '../fx-rate/fx-rate.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LiquidityBalancerPoller } from './adapters/poller/LiquidityBalancerPoller';

@Module({
  imports: [
    FxRateModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    LiquidityInitService,
    LiquidityBalancerPoller,
    { provide: ILiquidityService, useClass: LiquidityService },
    { provide: ILiquidityRepository, useClass: LiquidityRepository },
  ],
  exports: [ILiquidityService],
})
export class LiquidityModule {}
