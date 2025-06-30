import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { KonnectService } from './services/konnect.service';
import { FlouciService } from './services/flouci.service';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentController],
  providers: [PaymentService, KonnectService, FlouciService],
  exports: [PaymentService],
})
export class PaymentModule {}