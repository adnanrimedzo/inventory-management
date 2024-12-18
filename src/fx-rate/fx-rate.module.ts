import { Module } from '@nestjs/common';
import { FxRateController } from './adapters/api/controller/FxRateController';
import { IFxRateService } from './domain/ports/out/IFxRateService';
import { FxRateService } from './domain/service/FxRateService';
import { IFxRateRepository } from './domain/ports/in/IFxRateRepository';
import { FxRateRepository } from './adapters/database/FxRateRepository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [FxRateController],
  providers: [
    { provide: IFxRateService, useClass: FxRateService },
    { provide: IFxRateRepository, useClass: FxRateRepository },
  ],
  exports: [IFxRateService],
})
export class FxRateModule {}
