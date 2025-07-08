import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { PaymentType } from './entities/payment-type.entity';
import { ReservationStatus } from './entities/reservation-status.entity';
import { CourtModule } from '../court/court.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, PaymentType, ReservationStatus]),
    CourtModule
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}