import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    create(createReservationDto: CreateReservationDto): Promise<import("./entities/reservation.entity").Reservation>;
    findAll(): Promise<import("./entities/reservation.entity").Reservation[]>;
    getAvailableSlots(date: string, courtId?: string): Promise<string[]>;
    checkAvailability(checkAvailabilityDto: CheckAvailabilityDto): Promise<boolean>;
    getCalendarData(startDate: string, endDate: string): Promise<import("./entities/reservation.entity").Reservation[]>;
    confirmPayment(id: string, paymentId: string): Promise<import("./entities/reservation.entity").Reservation>;
    findOne(id: string): Promise<import("./entities/reservation.entity").Reservation>;
    cancel(id: string): Promise<import("./entities/reservation.entity").Reservation>;
    getDailyStats(date: string): Promise<any>;
    getMonthlyStats(year: string, month: string): Promise<any>;
    updateCourt(id: string, courtId: number): Promise<import("./entities/reservation.entity").Reservation>;
}
