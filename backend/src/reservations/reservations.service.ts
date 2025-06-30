import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { Date: reservationDate, StartTime, CourtId } = createReservationDto;
    
    const isAvailable = await this.checkAvailability({
      date: reservationDate,
      time: StartTime,
      courtId: CourtId
    });

    if (!isAvailable) {
      throw new BadRequestException('This time slot is already reserved');
    }

    const endTime = createReservationDto.EndTime || this.calculateEndTime(StartTime);

    const reservation = this.reservationsRepository.create({
      ...createReservationDto,
      Date: new Date(reservationDate),
      EndTime: endTime,
      CreatedAt: new Date(),
      IsPaid: createReservationDto.IsPaid || false,
    });

    return this.reservationsRepository.save(reservation);
  }

  async checkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<boolean> {
    const { date, time, courtId } = checkAvailabilityDto;
    const reservationDate = new Date(date);
    
    const newStartTime = time;
    const newEndTime = this.calculateEndTime(time);

    // Check for any overlapping reservations
    const queryBuilder = this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.Date = :date', { date: reservationDate })
      .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] }) // En attente, Confirmée, Payée
      .andWhere(
        '(reservation.StartTime < :newEndTime AND reservation.EndTime > :newStartTime)',
        { newStartTime, newEndTime }
      );
    
    if (courtId) {
      queryBuilder.andWhere('reservation.CourtId = :courtId', { courtId });
    }

    const overlappingReservations = await queryBuilder.getMany();

    return overlappingReservations.length === 0;
  }

  async getAvailableSlots(date: string, courtId?: number): Promise<string[]> {
    const reservationDate = new Date(date);
    const queryBuilder = this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.Date = :date', { date: reservationDate })
      .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] }); // En attente, Confirmée, Payée
    
    if (courtId) {
      queryBuilder.andWhere('reservation.CourtId = :courtId', { courtId });
    }

    const allReservations = await queryBuilder.getMany();

    const allSlots = this.generateTimeSlots();
    const unavailableSlots: string[] = [];

    // For each reservation, mark all overlapping slots as unavailable
    for (const reservation of allReservations) {
      const reservationStart = this.timeToMinutes(reservation.StartTime);
      const reservationEnd = this.timeToMinutes(reservation.EndTime);

      for (const slot of allSlots) {
        const slotStart = this.timeToMinutes(slot);
        const slotEnd = slotStart + 90; // 90 minutes duration

        // Check if this slot overlaps with the reservation
        if (slotStart < reservationEnd && slotEnd > reservationStart) {
          if (!unavailableSlots.includes(slot)) {
            unavailableSlots.push(slot);
          }
        }
      }
    }
    
    return allSlots.filter(slot => !unavailableSlots.includes(slot));
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      order: {
        Date: 'DESC',
        StartTime: 'ASC'
      }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: {
        Date: Between(startDate, endDate),
        Status: 2 // Confirmée
      },
      order: {
        Date: 'ASC',
        StartTime: 'ASC'
      }
    });
  }

  async confirmPayment(reservationId: number, paymentId: string, gateway?: string): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { Id: reservationId }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    reservation.Status = 4; // Payée
    reservation.IsPaid = true;

    return this.reservationsRepository.save(reservation);
  }

  async cancelReservation(reservationId: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { Id: reservationId }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    reservation.Status = 3; // Annulée
    return this.reservationsRepository.save(reservation);
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { Id: id }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    return reservation;
  }

  private calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 90;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    
    // Generate 90-minute slots for 24/7 availability
    // Starting from 00:00, every 90 minutes: 00:00, 01:30, 03:00, 04:30, etc.
    for (let minutes = 0; minutes < 24 * 60; minutes += 90) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      slots.push(timeSlot);
    }
    
    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async getDailyStats(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await this.reservationsRepository.find({
      where: {
        Date: Between(startOfDay, endOfDay)
      }
    });

    const totalReservations = reservations.length;
    const confirmedReservations = reservations.filter(r => r.Status === 2).length;
    const paidReservations = reservations.filter(r => r.Status === 4).length;
    const cancelledReservations = reservations.filter(r => r.Status === 3).length;
    const totalRevenue = reservations
      .filter(r => r.Status === 4)
      .reduce((sum, r) => sum + Number(r.Price), 0);

    return {
      date,
      totalReservations,
      confirmedReservations,
      paidReservations,
      cancelledReservations,
      totalRevenue,
      reservations
    };
  }

  async getMonthlyStats(year: number, month: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const reservations = await this.reservationsRepository.find({
      where: {
        Date: Between(startDate, endDate),
        Status: 4 // Payée
      }
    });

    const totalRevenue = reservations.reduce((sum, r) => sum + Number(r.Price), 0);
    const totalReservations = reservations.length;

    // Group by day
    const dailyStats = {};
    reservations.forEach(reservation => {
      const dayKey = reservation.Date.toISOString().split('T')[0];
      if (!dailyStats[dayKey]) {
        dailyStats[dayKey] = {
          count: 0,
          revenue: 0
        };
      }
      dailyStats[dayKey].count++;
      dailyStats[dayKey].revenue += Number(reservation.Price);
    });

    return {
      year,
      month,
      totalReservations,
      totalRevenue,
      dailyStats
    };
  }
}