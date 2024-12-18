import { Test, TestingModule } from '@nestjs/testing';
import { SettlementPoller } from '../../src/settlement/adapters/poller/SettlementPoller';
import { RedisLockService } from '@lostpfg/nestjs-redis-lock';
import { ISettlementService } from '../../src/settlement/domain/ports/out/ISettlementService';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import type { LockedResource } from '@lostpfg/nestjs-redis-lock/dist/types';

describe('SettlementPoller', () => {
  let settlementPoller: SettlementPoller;
  let lockService: RedisLockService;
  let settlementService: ISettlementService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementPoller,
        {
          provide: RedisLockService,
          useValue: {
            lock: jest.fn(),
            unlock: jest.fn(),
          },
        },
        {
          provide: ISettlementService,
          useValue: {
            processSettlement: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
            getCronJobs: jest.fn().mockReturnValue(new Map<string, CronJob>()),
          },
        },
      ],
    }).compile();

    settlementPoller = module.get<SettlementPoller>(SettlementPoller);
    lockService = module.get<RedisLockService>(RedisLockService);
    settlementService = module.get<ISettlementService>(ISettlementService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect(settlementPoller).toBeDefined();
  });

  it('should add cron jobs on initialization', () => {
    process.env.SUPPORTED_CURRENCIES_PERIOD = '5,10';
    process.env.SUPPORTED_CURRENCIES = 'USD,EUR';
    process.env.SETTLEMENT_INTERVAL = '10';

    const addCronJobSpy = jest.spyOn(schedulerRegistry, 'addCronJob');
    new SettlementPoller(lockService, settlementService, schedulerRegistry);

    expect(addCronJobSpy).toHaveBeenCalledTimes(7);
  });

  it('should process settlement for currency', async () => {
    const lock: LockedResource = {
      ttl: 50000,
      value: 'lock',
      resource: '',
      acquiredAt: 1,
      expiresAt: 1,
    };
    jest.spyOn(lockService, 'lock').mockResolvedValue(lock);
    jest.spyOn(lockService, 'unlock').mockResolvedValue(undefined);
    jest.spyOn(settlementService, 'processSettlement').mockResolvedValue(1);

    await settlementPoller['pollForCurrency']('USD', 10, 5);

    expect(lockService.lock).toHaveBeenCalledWith('settlement-keyUSD', {
      ttl: 50000,
    });
    expect(settlementService.processSettlement).toHaveBeenCalledWith('USD', 10);
    expect(lockService.unlock).toHaveBeenCalledWith(lock);
  });

  it('should handle lock acquisition failure', async () => {
    jest.spyOn(lockService, 'lock').mockResolvedValue(null);

    await settlementPoller['pollForCurrency']('USD', 10, 5);

    expect(lockService.lock).toHaveBeenCalledWith('settlement-keyUSD', {
      ttl: 50000,
    });
    expect(settlementService.processSettlement).not.toHaveBeenCalled();
  });

  it('should handle errors during settlement processing', async () => {
    const lock: LockedResource = {
      ttl: 50000,
      value: 'lock',
      resource: '',
      acquiredAt: 1,
      expiresAt: 1,
    };
    jest.spyOn(lockService, 'lock').mockResolvedValue(lock);
    jest.spyOn(lockService, 'unlock').mockResolvedValue(undefined);
    jest
      .spyOn(settlementService, 'processSettlement')
      .mockRejectedValue(new Error('Test error'));

    await settlementPoller['pollForCurrency']('USD', 10, 5);

    expect(lockService.lock).toHaveBeenCalledWith('settlement-keyUSD', {
      ttl: 50000,
    });
    expect(settlementService.processSettlement).toHaveBeenCalledWith('USD', 10);
    expect(lockService.unlock).toHaveBeenCalledWith(lock);
  });
});
