import { Test, TestingModule } from '@nestjs/testing';
import { Currency } from 'money';
import { FxRateController } from '../../src/fx-rate/adapters/api/controller/FxRateController';
import { IFxRateService } from '../../src/fx-rate/domain/ports/out/IFxRateService';
import { FxRateRequest } from '../../src/fx-rate/adapters/api/request/FxReteRequest';
import { FxRateDto } from '../../src/fx-rate/domain/model/dto/FxRateDto';

describe('FxRateController', () => {
  let controller: FxRateController;
  let service: IFxRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FxRateController],
      providers: [
        {
          provide: IFxRateService,
          useValue: {
            updateFxRate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FxRateController>(FxRateController);
    service = module.get<IFxRateService>(IFxRateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update FX rate', async () => {
    const fxRateRequest: FxRateRequest = {
      pair: 'USD/EUR',
      rate: '1.2',
      timestamp: new Date().toISOString(),
    };
    const fxRateDto = new FxRateDto(
      'USD' as Currency,
      'EUR' as Currency,
      1.2,
      new Date(fxRateRequest.timestamp),
    );

    jest.spyOn(service, 'updateFxRate').mockResolvedValue(undefined);

    await controller.updateFxRate(fxRateRequest);

    expect(service.updateFxRate).toHaveBeenCalledWith(fxRateDto);
  });
});
