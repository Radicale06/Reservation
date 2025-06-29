import { Controller, Get, Post, Body, Param, Query, ValidationPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body(ValidationPipe) createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('available-slots')
  getAvailableSlots(@Query('date') date: string) {
    return this.reservationsService.getAvailableSlots(date);
  }

  @Post('check-availability')
  checkAvailability(@Body(ValidationPipe) checkAvailabilityDto: CheckAvailabilityDto) {
    return this.reservationsService.checkAvailability(checkAvailabilityDto);
  }

  @Get('calendar')
  getCalendarData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reservationsService.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post(':id/confirm-payment')
  confirmPayment(
    @Param('id') id: string,
    @Body('paymentId') paymentId: string
  ) {
    return this.reservationsService.confirmPayment(+id, paymentId);
  }
}