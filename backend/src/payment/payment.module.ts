import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { KonnectService } from './services/konnect.service';
import { FlouciService } from './services/flouci.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, KonnectService, FlouciService],
  exports: [PaymentService],
})
export class PaymentModule {}