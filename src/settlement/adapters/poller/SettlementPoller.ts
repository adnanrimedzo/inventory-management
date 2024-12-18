import { Inject, Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { RedisLockService } from '@lostpfg/nestjs-redis-lock';
import { ISettlementService } from '../../domain/ports/out/ISettlementService';
import * as process from 'node:process';

@Injectable()
export class SettlementPoller {
  private readonly logger = new Logger(SettlementPoller.name);
  private readonly settlementKey = 'settlement-key';
  private readonly cronKey = 'cron-key';

  constructor(
    private readonly lockService: RedisLockService,
    @Inject(ISettlementService)
    private readonly settlementService: ISettlementService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    const periods = process.env.SUPPORTED_CURRENCIES_PERIOD.split(',');
    const currencies = process.env.SUPPORTED_CURRENCIES.split(',');

    for (let i = 0; i < periods.length; i++) {
      this.addCronJob(currencies[i], periods[i]);
    }

    this.schedulerRegistry.getCronJobs().forEach((job) => job.start());
  }

  private async pollForCurrency(
    currency: string,
    blockSize: number,
    period: number,
  ) {
    let lock;
    try {
      this.logger.log(`Polling for currency ${currency}`);
      lock = await this.lockService.lock(this.settlementKey.concat(currency), {
        ttl: period * 1000 * 10,
      });
      if (!lock) {
        this.logger.warn('Failed to acquire lock');
        return;
      }
      await this.settlementService.processSettlement(currency, blockSize);
      this.logger.log(`Processed settlement for currency ${currency}`);
    } catch (error) {
      this.logger.error(`Error processing settlement for currency ${currency}`);
      this.logger.error(error);
    } finally {
      await this.unlock(lock);
    }
  }

  private async unlock(lock) {
    try {
      if (lock) {
        await this.lockService.unlock(lock);
      }
    } catch (error) {
      this.logger.warn(error);
    }
  }

  private addCronJob(currency: any, period: any) {
    const name = this.cronKey.concat(currency);
    const job = new CronJob(`*/${period} * * * * *`, () => {
      this.logger.log(`time (${period})sn for job ${name} to run!`);
      this.pollForCurrency(
        currency,
        parseInt(process.env.SETTLEMENT_INTERVAL),
        period,
      );
    });

    this.schedulerRegistry.addCronJob(name, job);
  }
}
