import {
  IsNotEmpty,
  IsString,
  IsISO8601,
  Matches,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FxRateRequest {
  @ApiProperty({
    description: 'Currency pair',
    example: 'USD/EUR',
    format: 'XXX/XXX',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Z]{3}\/[A-Z]{3}$/, {
    message: 'pair must be in the format XXX/XXX',
  })
  public pair: string;

  @ApiProperty({
    description: 'Currency rate',
    example: 8.1345,
    format: 'string',
  })
  @IsNotEmpty()
  @IsString()
  public rate: string;

  @ApiProperty({
    description: 'Currency timestamp',
    example: '2024-12-18T00:12:12.991Z',
    format: 'YYYY-MM-DDTHH:MM:SS.SSSZ',
  })
  @IsNotEmpty()
  @IsISO8601()
  public timestamp: string;
}
