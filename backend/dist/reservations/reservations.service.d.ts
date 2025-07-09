import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { CourtService } from '../court/court.service';
export declare class ReservationsService {
    private reservationsRepository;
    private courtService;
    constructor(reservationsRepository: Repository<Reservation>, courtService: CourtService);
    create(createReservationDto: CreateReservationDto): Promise<Reservation>;
    checkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<boolean>;
    checkSpecificCourtAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<boolean>;
    getAvailableSlots(date: string, courtId?: number): Promise<string[]>;
    findAll(): Promise<Reservation[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]>;
    confirmPayment(reservationId: number, paymentId: string, gateway?: string): Promise<Reservation>;
    cancelReservation(reservationId: number): Promise<Reservation>;
    findById(id: number): Promise<Reservation>;
    private calculateEndTime;
    private generateTimeSlots;
    private timeToMinutes;
    findAvailableCourtByType(date: string, time: string, stadiumType: string): Promise<any>;
    updateCourtAssignment(reservationId: number, newCourtId: number): Promise<Reservation>;
    getDailyStats(date: Date): Promise<any>;
    getMonthlyStats(year: number, month: number): Promise<any>;
}
