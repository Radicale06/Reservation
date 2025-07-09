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
      .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] }) // En attente, Confirmée, Payée
      .andWhere(
        '(reservation.StartTime < :newEndTime AND reservation.EndTime > :newStartTime)',
        { newStartTime, newEndTime }
      )
      .getMany();

    
    if (overlappingReservations.length > 0) {
      console.log(`⚠️ Overlapping reservations:`, overlappingReservations.map(r => 
        `ID:${r.Id} - ${r.PlayerFullName} (${r.StartTime}-${r.EndTime}) - Status:${r.Status}`
      ));
    }

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
    console.log(`🔍 Finding available court for: ${stadiumType} stadium on ${date} at ${time}`);
    
    const reservationDate = new Date(date);
    const newStartTime = time;
    const newEndTime = this.calculateEndTime(time);
    
    console.log(`🔍 Looking for: ${stadiumType} court on ${reservationDate.toISOString().split('T')[0]} from ${newStartTime} to ${newEndTime}`);
    
    // Use a direct database query to find available courts with proper filtering
    const availableCourts = await this.reservationsRepository.query(`
      SELECT c.Id, c.Name, c.StadiumType, c.IsActive
      FROM Court c
      WHERE c.IsActive = 1 
        AND LOWER(c.StadiumType) = LOWER(?)
        AND c.Id NOT IN (
          SELECT DISTINCT r.CourtId 
          FROM Reservation r
          WHERE r.Date = ?
            AND r.CourtId IS NOT NULL
            AND r.Status IN (1, 2, 4)
            AND (r.StartTime < ? AND r.EndTime > ?)
        )
      ORDER BY c.Id
      LIMIT 1
    `, [stadiumType, reservationDate, newEndTime, newStartTime]);
    
    console.log(`📍 Available courts of type '${stadiumType}' found: ${availableCourts.length}`);
    
    if (availableCourts.length === 0) {
      console.log(`❌ No available courts found for stadium type: ${stadiumType}`);
      return null;
    }

    const selectedCourt = availableCourts[0];
    console.log(`✅ Selected court: ${selectedCourt.Name} (ID: ${selectedCourt.Id}) - ASSIGNED!`);
    return selectedCourt;
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