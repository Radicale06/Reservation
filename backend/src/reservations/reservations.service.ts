import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CourtService } from '../court/court.service';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    private courtService: CourtService,
  ) {}

  async create(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const { Date: reservationDate, StartTime, StadiumType, PlayerFullName } = createReservationDto;
    let { CourtId } = createReservationDto;
    
    // If no court is specified, automatically assign one based on stadium type
    if (!CourtId) {
      const availableCourt = await this.findAvailableCourtByType(
        reservationDate,
        StartTime,
        StadiumType
      );
      
      if (!availableCourt) {
        throw new BadRequestException(
          `No ${StadiumType} court available for this time slot`
        );
      }
      
      CourtId = availableCourt.Id;
    } else {
      // If court is specified, check if it's available
      const isAvailable = await this.checkSpecificCourtAvailability({
        date: reservationDate,
        time: StartTime,
        courtId: CourtId
      });

      if (!isAvailable) {
        throw new BadRequestException('This time slot is already reserved');
      }
    }

    const endTime = createReservationDto.EndTime || this.calculateEndTime(StartTime);

    const reservation = this.reservationsRepository.create({
      ...createReservationDto,
      CourtId,
      Date: new Date(reservationDate),
      EndTime: endTime,
      CreatedAt: new Date(),
      IsPaid: createReservationDto.IsPaid || false,
    });

    const savedReservation = await this.reservationsRepository.save(reservation);
    return savedReservation;
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
      .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2] }) // En attente, Payée
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

  async checkSpecificCourtAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<boolean> {
    const { date, time, courtId } = checkAvailabilityDto;
    
    if (!courtId) {
      return false;
    }

    const reservationDate = new Date(date);
    const newStartTime = time;
    const newEndTime = this.calculateEndTime(time);

    // First, verify the court exists and is active
    const court = await this.courtService.findOne(courtId);
    if (!court) {
      return false;
    }
    
    if (!court.IsActive) {
      return false;
    }

    // Check for any overlapping reservations for this specific court
    const overlappingReservations = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .where('reservation.Date = :date', { date: reservationDate })
      .andWhere('reservation.CourtId = :courtId', { courtId })
      .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2] }) // En attente, Payée
      .andWhere(
        '(reservation.StartTime < :newEndTime AND reservation.EndTime > :newStartTime)',
        { newStartTime, newEndTime }
      )
      .getMany();

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
      relations: ['court'],
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

    reservation.Status = 2; // Payée
    reservation.IsPaid = true;

    return this.reservationsRepository.save(reservation);
  }

  async cancelReservation(reservationId: number): Promise<void> {
    const reservation = await this.reservationsRepository.findOne({
      where: { Id: reservationId }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // Simply delete the reservation instead of marking as cancelled
    await this.reservationsRepository.remove(reservation);
  }

  async togglePaymentStatus(reservationId: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { Id: reservationId }
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // Toggle between status 1 (en attente) and 2 (payé)
    reservation.Status = reservation.Status === 1 ? 2 : 1;
    reservation.IsPaid = reservation.Status === 2;

    return this.reservationsRepository.save(reservation);
  }

  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { Id: id },
      relations: ['court']
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

  async findAvailableCourtByType(
    date: string,
    time: string,
    stadiumType: string
  ): Promise<any> {
    // Get current court assignments to make intelligent decisions
    const assignments = await this.getCourtAssignments(date, time);
    
    // Get available courts for the requested stadium type
    const availableCourts = assignments[stadiumType]?.available || [];
    
    if (availableCourts.length === 0) {
      return null;
    }
    
    // Return the first available court (you could add more logic here for optimization)
    // For example: prefer courts with specific sport types, or load balancing
    const selectedCourt = availableCourts[0];
    
    // Get full court details
    const allCourts = await this.courtService.findActive();
    return allCourts.find(court => court.Id === selectedCourt.courtId);
  }

  async updateCourtAssignment(
    reservationId: number,
    newCourtId: number
  ): Promise<Reservation> {
    const reservation = await this.findById(reservationId);

    // Check if the new court is available for this time slot
    const isAvailable = await this.checkAvailability({
      date: reservation.Date.toISOString().split('T')[0],
      time: reservation.StartTime,
      courtId: newCourtId
    });

    if (!isAvailable) {
      throw new BadRequestException(
        'The selected court is not available for this time slot'
      );
    }

    reservation.CourtId = newCourtId;
    return this.reservationsRepository.save(reservation);
  }

  async getDailyStats(date: Date): Promise<any> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await this.reservationsRepository.find({
      where: {
        Date: Between(startOfDay, endOfDay)
      },
      relations: ['court']
    });

    const totalReservations = reservations.length;
    const paidReservations = reservations.filter(r => r.Status === 2).length;
    const pendingReservations = reservations.filter(r => r.Status === 1).length;
    const totalRevenue = reservations
      .filter(r => r.Status === 2)
      .reduce((sum, r) => sum + Number(r.Price), 0);

    return {
      date,
      totalReservations,
      pendingReservations,
      paidReservations,
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
        Status: 2 // Payée
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

  async getAvailableStadiumTypes(date: string, time: string): Promise<{
    indoor: { available: boolean; courts: number; availableCourts: any[] };
    outdoor: { available: boolean; courts: number; availableCourts: any[] };
  }> {
    // Get all active courts
    const allCourts = await this.courtService.findActive();
    
    // Separate by stadium type (handle legacy courts without StadiumType)
    const indoorCourts = allCourts.filter(court => {
      const stadiumType = court.StadiumType || court.Type || 'outdoor';
      return stadiumType.toLowerCase().includes('indoor') || stadiumType.toLowerCase().includes('int');
    });
    
    const outdoorCourts = allCourts.filter(court => {
      const stadiumType = court.StadiumType || court.Type || 'outdoor';
      return stadiumType.toLowerCase().includes('outdoor') || 
             stadiumType.toLowerCase().includes('ext') ||
             (!stadiumType.toLowerCase().includes('indoor') && !stadiumType.toLowerCase().includes('int'));
    });
    
    // Check availability for each type
    const checkTypeAvailability = async (courts: any[]) => {
      const availableCourts: any[] = [];
      
      for (const court of courts) {
        const isAvailable = await this.checkSpecificCourtAvailability({
          date,
          time,
          courtId: court.Id
        });
        
        if (isAvailable) {
          availableCourts.push(court);
        }
      }
      
      return {
        available: availableCourts.length > 0,
        courts: courts.length,
        availableCourts
      };
    };
    
    const [indoorAvailability, outdoorAvailability] = await Promise.all([
      checkTypeAvailability(indoorCourts),
      checkTypeAvailability(outdoorCourts)
    ]);
    
    return {
      indoor: indoorAvailability,
      outdoor: outdoorAvailability
    };
  }

  async getCourtAssignments(date: string, time: string): Promise<any> {
    const reservationDate = new Date(date);
    const endTime = this.calculateEndTime(time);
    
    // Get all reservations that overlap with the requested time
    const overlappingReservations = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.court', 'court')
      .where('reservation.Date = :date', { date: reservationDate })
      .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] })
      .andWhere(
        '(reservation.StartTime < :endTime AND reservation.EndTime > :startTime)',
        { startTime: time, endTime }
      )
      .getMany();
    
    // Get all active courts
    const allCourts = await this.courtService.findActive();
    
    // Create assignment map
    const assignments = {
      indoor: {
        total: allCourts.filter(c => c.StadiumType === 'indoor').length,
        occupied: [] as any[],
        available: [] as any[]
      },
      outdoor: {
        total: allCourts.filter(c => c.StadiumType === 'outdoor').length,
        occupied: [] as any[],
        available: [] as any[]
      }
    };
    
    // Mark occupied courts
    overlappingReservations.forEach(reservation => {
      if (reservation.court) {
        const type = reservation.court.StadiumType;
        assignments[type].occupied.push({
          courtId: reservation.court.Id,
          courtName: reservation.court.Name,
          reservationId: reservation.Id,
          playerName: reservation.PlayerFullName
        });
      }
    });
    
    // Mark available courts
    allCourts.forEach(court => {
      const isOccupied = overlappingReservations.some(r => r.CourtId === court.Id);
      if (!isOccupied) {
        assignments[court.StadiumType].available.push({
          courtId: court.Id,
          courtName: court.Name,
          sportType: court.SportType
        });
      }
    });
    
    return assignments;
  }
}