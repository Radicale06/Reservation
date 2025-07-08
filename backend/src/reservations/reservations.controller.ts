import { Controller, Get, Post, Put, Body, Param, Query, ValidationPipe } from '@nestjs/common';
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
  getAvailableSlots(@Query('date') date: string, @Query('courtId') courtId?: string) {
    return this.reservationsService.getAvailableSlots(date, courtId ? +courtId : undefined);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findById(+id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancelReservation(+id);
  }

  @Get('stats/daily')
  getDailyStats(@Query('date') date: string) {
    return this.reservationsService.getDailyStats(new Date(date));
  }

  @Get('stats/monthly')
  getMonthlyStats(@Query('year') year: string, @Query('month') month: string) {
    return this.reservationsService.getMonthlyStats(+year, +month);
  }

  @Put(':id/court')
  updateCourt(@Param('id') id: string, @Body('courtId') courtId: number) {
    return this.reservationsService.updateCourtAssignment(+id, courtId);
  }
}