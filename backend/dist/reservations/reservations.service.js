"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reservation_entity_1 = require("./entities/reservation.entity");
const court_service_1 = require("../court/court.service");
let ReservationsService = class ReservationsService {
    reservationsRepository;
    courtService;
    constructor(reservationsRepository, courtService) {
        this.reservationsRepository = reservationsRepository;
        this.courtService = courtService;
    }
    async create(createReservationDto) {
        const { Date: reservationDate, StartTime, StadiumType, PlayerFullName } = createReservationDto;
        let { CourtId } = createReservationDto;
        if (!CourtId) {
            const availableCourt = await this.findAvailableCourtByType(reservationDate, StartTime, StadiumType);
            if (!availableCourt) {
                throw new common_1.BadRequestException(`No ${StadiumType} court available for this time slot`);
            }
            CourtId = availableCourt.Id;
        }
        else {
            const isAvailable = await this.checkSpecificCourtAvailability({
                date: reservationDate,
                time: StartTime,
                courtId: CourtId
            });
            if (!isAvailable) {
                throw new common_1.BadRequestException('This time slot is already reserved');
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
    async checkAvailability(checkAvailabilityDto) {
        const { date, time, courtId } = checkAvailabilityDto;
        const reservationDate = new Date(date);
        const newStartTime = time;
        const newEndTime = this.calculateEndTime(time);
        const queryBuilder = this.reservationsRepository
            .createQueryBuilder('reservation')
            .where('reservation.Date = :date', { date: reservationDate })
            .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] })
            .andWhere('(reservation.StartTime < :newEndTime AND reservation.EndTime > :newStartTime)', { newStartTime, newEndTime });
        if (courtId) {
            queryBuilder.andWhere('reservation.CourtId = :courtId', { courtId });
        }
        const overlappingReservations = await queryBuilder.getMany();
        return overlappingReservations.length === 0;
    }
    async checkSpecificCourtAvailability(checkAvailabilityDto) {
        const { date, time, courtId } = checkAvailabilityDto;
        if (!courtId) {
            return false;
        }
        const reservationDate = new Date(date);
        const newStartTime = time;
        const newEndTime = this.calculateEndTime(time);
        const court = await this.courtService.findOne(courtId);
        if (!court) {
            return false;
        }
        if (!court.IsActive) {
            return false;
        }
        const overlappingReservations = await this.reservationsRepository
            .createQueryBuilder('reservation')
            .where('reservation.Date = :date', { date: reservationDate })
            .andWhere('reservation.CourtId = :courtId', { courtId })
            .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] })
            .andWhere('(reservation.StartTime < :newEndTime AND reservation.EndTime > :newStartTime)', { newStartTime, newEndTime })
            .getMany();
        return overlappingReservations.length === 0;
    }
    async getAvailableSlots(date, courtId) {
        const reservationDate = new Date(date);
        const queryBuilder = this.reservationsRepository
            .createQueryBuilder('reservation')
            .where('reservation.Date = :date', { date: reservationDate })
            .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] });
        if (courtId) {
            queryBuilder.andWhere('reservation.CourtId = :courtId', { courtId });
        }
        const allReservations = await queryBuilder.getMany();
        const allSlots = this.generateTimeSlots();
        const unavailableSlots = [];
        for (const reservation of allReservations) {
            const reservationStart = this.timeToMinutes(reservation.StartTime);
            const reservationEnd = this.timeToMinutes(reservation.EndTime);
            for (const slot of allSlots) {
                const slotStart = this.timeToMinutes(slot);
                const slotEnd = slotStart + 90;
                if (slotStart < reservationEnd && slotEnd > reservationStart) {
                    if (!unavailableSlots.includes(slot)) {
                        unavailableSlots.push(slot);
                    }
                }
            }
        }
        return allSlots.filter(slot => !unavailableSlots.includes(slot));
    }
    async findAll() {
        return this.reservationsRepository.find({
            relations: ['court'],
            order: {
                Date: 'DESC',
                StartTime: 'ASC'
            }
        });
    }
    async findByDateRange(startDate, endDate) {
        return this.reservationsRepository.find({
            where: {
                Date: (0, typeorm_2.Between)(startDate, endDate),
                Status: 2
            },
            order: {
                Date: 'ASC',
                StartTime: 'ASC'
            }
        });
    }
    async confirmPayment(reservationId, paymentId, gateway) {
        const reservation = await this.reservationsRepository.findOne({
            where: { Id: reservationId }
        });
        if (!reservation) {
            throw new common_1.BadRequestException('Reservation not found');
        }
        reservation.Status = 4;
        reservation.IsPaid = true;
        return this.reservationsRepository.save(reservation);
    }
    async cancelReservation(reservationId) {
        const reservation = await this.reservationsRepository.findOne({
            where: { Id: reservationId }
        });
        if (!reservation) {
            throw new common_1.BadRequestException('Reservation not found');
        }
        reservation.Status = 3;
        return this.reservationsRepository.save(reservation);
    }
    async findById(id) {
        const reservation = await this.reservationsRepository.findOne({
            where: { Id: id },
            relations: ['court']
        });
        if (!reservation) {
            throw new common_1.BadRequestException('Reservation not found');
        }
        return reservation;
    }
    calculateEndTime(startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + 90;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    }
    generateTimeSlots() {
        const slots = [];
        for (let minutes = 0; minutes < 24 * 60; minutes += 90) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeSlot = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            slots.push(timeSlot);
        }
        return slots;
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    async findAvailableCourtByType(date, time, stadiumType) {
        const allCourts = await this.courtService.findActive();
        const courtsOfType = allCourts.filter(court => court.IsActive && court.StadiumType && court.StadiumType.toLowerCase() === stadiumType.toLowerCase());
        if (courtsOfType.length === 0) {
            return null;
        }
        for (const court of courtsOfType) {
            if (!court.IsActive) {
                continue;
            }
            const isAvailable = await this.checkSpecificCourtAvailability({
                date,
                time,
                courtId: court.Id
            });
            if (isAvailable) {
                return court;
            }
        }
        return null;
    }
    async updateCourtAssignment(reservationId, newCourtId) {
        const reservation = await this.findById(reservationId);
        const isAvailable = await this.checkAvailability({
            date: reservation.Date.toISOString().split('T')[0],
            time: reservation.StartTime,
            courtId: newCourtId
        });
        if (!isAvailable) {
            throw new common_1.BadRequestException('The selected court is not available for this time slot');
        }
        reservation.CourtId = newCourtId;
        return this.reservationsRepository.save(reservation);
    }
    async getDailyStats(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const reservations = await this.reservationsRepository.find({
            where: {
                Date: (0, typeorm_2.Between)(startOfDay, endOfDay)
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
    async getMonthlyStats(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const reservations = await this.reservationsRepository.find({
            where: {
                Date: (0, typeorm_2.Between)(startDate, endDate),
                Status: 4
            }
        });
        const totalRevenue = reservations.reduce((sum, r) => sum + Number(r.Price), 0);
        const totalReservations = reservations.length;
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        court_service_1.CourtService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map