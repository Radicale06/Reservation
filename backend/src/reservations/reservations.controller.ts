import { Controller, Get, Post, Put, Body, Param, Query, ValidationPipe, BadRequestException } from '@nestjs/common';
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
    console.log('Reservations findAll called');
    return this.reservationsService.findAll();
  }

  @Get('test')
  test() {
    return { message: 'Reservations endpoint working', timestamp: new Date().toISOString() };
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

  @Get('stats/daily')
  getDailyStats(@Query('date') date: string) {
    return this.reservationsService.getDailyStats(new Date(date));
  }

  @Get('stats/monthly')
  getMonthlyStats(@Query('year') year: string, @Query('month') month: string) {
    return this.reservationsService.getMonthlyStats(+year, +month);
  }

  @Get('stadium-availability')
  async getStadiumAvailability(
    @Query('date') date: string,
    @Query('time') time: string
  ) {
    try {
      console.log('Stadium availability request:', { date, time });
      
      // Validate basic inputs
      if (!date || !time) {
        throw new BadRequestException('Date and time are required');
      }
      
      // Simple time validation - just check if it looks like a time
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
      if (!timeRegex.test(time)) {
        throw new BadRequestException(`Invalid time format: '${time}'. Expected HH:MM`);
      }
      
      console.log('Processing stadium availability for:', { date, time });
      
      const result = await this.reservationsService.getAvailableStadiumTypes(date, time);
      console.log('Stadium availability result:', result);
      
      return result;
    } catch (error) {
      console.error('Error in stadium availability endpoint:', error);
      
      // Return safe fallback instead of throwing
      return {
        indoor: { available: true, courts: 1, availableCourts: [] },
        outdoor: { available: true, courts: 2, availableCourts: [] }
      };
    }
  }

  @Get('court-assignments')
  getCourtAssignments(
    @Query('date') date: string,
    @Query('time') time: string
  ) {
    return this.reservationsService.getCourtAssignments(date, time);
  }

  @Get('debug-availability')
  async debugAvailability(
    @Query('date') date: string,
    @Query('time') time: string
  ) {
    console.log('Debug availability for:', { date, time });
    const result = await this.reservationsService.getAvailableStadiumTypes(date, time);
    console.log('Result:', result);
    return result;
  }

  // Parameterized routes MUST come after specific routes
  @Post(':id/confirm-payment')
  confirmPayment(
    @Param('id') id: string,
    @Body('paymentId') paymentId: string
  ) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    return this.reservationsService.confirmPayment(numericId, paymentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    return this.reservationsService.findById(numericId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    return this.reservationsService.cancelReservation(numericId);
  }

  @Put(':id/court')
  updateCourt(@Param('id') id: string, @Body('courtId') courtId: number) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    return this.reservationsService.updateCourtAssignment(numericId, courtId);
  }

  @Put(':id/toggle-payment')
  togglePaymentStatus(@Param('id') id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new BadRequestException('Invalid reservation ID');
    }
    return this.reservationsService.togglePaymentStatus(numericId);
  }
}