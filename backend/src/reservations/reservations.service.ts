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
    const { reservationDate, startTime } = createReservationDto;
    
    const isAvailable = await this.checkAvailability({
      date: reservationDate,
      time: startTime
    });

    if (!isAvailable) {
      throw new BadRequestException('This time slot is already reserved');
    }

    const endTime = this.calculateEndTime(startTime);

    const reservation = this.reservationsRepository.create({
      ...createReservationDto,
      reservationDate: new Date(reservationDate),
      endTime,
      price: 60,
    });

    return this.reservationsRepository.save(reservation);
  }

  async checkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<boolean> {
    const { date, time } = checkAvailabilityDto;
    const reservationDate = new Date(date);
    
    const newStartTime = time;
    const newEndTime = this.calculateEndTime(time);

    // Check for any overlapping reservations
    const overlappingReservations = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.reservationDate = :date', { date: reservationDate })
      .andWhere('reservation.status IN (:...statuses)', { statuses: ['pending', 'confirmed'] })
      .andWhere(
        '(reservation.startTime < :newEndTime AND reservation.endTime > :newStartTime)',
        { newStartTime, newEndTime }
      )
      .getMany();

    return overlappingReservations.length === 0;
  }

  async getAvailableSlots(date: string): Promise<string[]> {
    const reservationDate = new Date(date);
    const allReservations = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.reservationDate = :date', { date: reservationDate })
      .andWhere('reservation.status IN (:...statuses)', { statuses: ['pending', 'confirmed'] })
      .getMany();

    const allSlots = this.generateTimeSlots();
    const unavailableSlots: string[] = [];

    // For each reservation, mark all overlapping slots as unavailable
    for (const reservation of allReservations) {
      const reservationStart = this.timeToMinutes(reservation.startTime);
      const reservationEnd = this.timeToMinutes(reservation.endTime);

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
        reservationDate: 'ASC',
        startTime: 'ASC'
      }
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]> {
    return this.reservationsRepository.find({
      where: {
        reservationDate: Between(startDate, endDate),
        status: 'confirmed'
      },
      order: {
        reservationDate: 'ASC',
        startTime: 'ASC'
      }
    });
  }

  async confirmPayment(reservationId: number, paymentId: string, gateway?: string): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    reservation.status = 'confirmed';
    reservation.paymentId = paymentId;

    return this.reservationsRepository.save(reservation);
  }

  async cancelReservation(reservationId: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    reservation.status = 'cancelled';
    return this.reservationsRepository.save(reservation);
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id }
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
}