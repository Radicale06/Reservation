import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
export declare class ReservationsService {
    private reservationsRepository;
    constructor(reservationsRepository: Repository<Reservation>);
    create(createReservationDto: CreateReservationDto): Promise<Reservation>;
    checkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<boolean>;
    getAvailableSlots(date: string): Promise<string[]>;
    findAll(): Promise<Reservation[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Reservation[]>;
    confirmPayment(reservationId: number, paymentId: string, gateway?: string): Promise<Reservation>;
    cancelReservation(reservationId: number): Promise<Reservation>;
    findById(id: number): Promise<Reservation>;
    private calculateEndTime;
    private generateTimeSlots;
    private timeToMinutes;
}
