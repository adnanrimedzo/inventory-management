import {
  IsInt,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferRequest {
  @ApiProperty({ description: 'Unique transfer reference' })
  @IsNotEmpty()
  @IsString()
  externalReferenceId: string;

  @ApiProperty({ description: 'Sender id of the transfer', format: 'int32' })
  @IsNotEmpty()
  @IsInt()
  senderId: number;

  @ApiProperty({ description: 'Receiver id of the transfer', format: 'int32' })
  @IsNotEmpty()
  @IsInt()
  receiverId: number;

  @ApiProperty({
    description:
      'Amount to be transferred with 2 decimal places, ex: 100.00 -> 10000',
    example: 10000,
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Currency to convert from',
    example: 'USD',
    format: 'XXX',
  })
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  currencyX: string;

  @ApiProperty({
    description: 'Currency to convert to',
    example: 'EUR',
    format: 'XXX',
  })
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  currencyY: string;
}
