import { Body, Controller, Inject, Post } from '@nestjs/common';
import { FxRateRequest } from '../request/FxReteRequest';
import { FxRateDto } from '../../../domain/model/dto/FxRateDto';
import { IFxRateService } from '../../../domain/ports/out/IFxRateService';
import { FxRateError } from '../../../../settlement/domain/model/errors/FxRateError';

@Controller('fx-rate')
export class FxRateController {
  constructor(
    @Inject(IFxRateService) private readonly fxRateService: IFxRateService,
  ) {}

  @Post()
  updateFxRate(@Body() fxRateRequest: FxRateRequest) {
    const [currencyX, currencyY] = fxRateRequest.pair.split('/');

    const rate = parseFloat(fxRateRequest.rate);

    if (isNaN(rate)) {
      throw new FxRateError('Rate must be a number');
    }

    const fxRate = new FxRateDto(
      currencyX,
      currencyY,
      rate,
      new Date(fxRateRequest.timestamp),
    );
    return this.fxRateService.updateFxRate(fxRate);
  }
}
