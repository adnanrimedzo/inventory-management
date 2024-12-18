import { NestFactory } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { FxRateModule } from './fx-rate/fx-rate.module';
import { TransferModule } from './transfer/transfer.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigModule } from '@nestjs/config';
import { AllExceptionFilter } from './all-exception.filter';
import { SettlementModule } from './settlement/settlement.module';
import { LiquidityModule } from './liquidity/liquidity.module';
import { RevenueModule } from './revenue/revenue.module';

@Module({
  imports: [
    FxRateModule,
    TransferModule,
    SettlementModule,
    LiquidityModule,
    RevenueModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // api documentation
  const config = new DocumentBuilder()
    .setTitle('Currency Transfer API')
    .setDescription('API for currency transfer and FX rate updates')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // validation
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
