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
        reservationDate.setHours(0, 0, 0, 0);
        const newStartTime = time;
        const newEndTime = this.calculateEndTime(time);
        const queryBuilder = this.reservationsRepository
            .createQueryBuilder('reservation')
            .where('reservation.Date = :date', { date: reservationDate })
            .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2] })
            .andWhere('(reservation.StartTime < :newEndTime AND reservation.EndTime > :newStartTime)', { newStartTime, newEndTime });
        if (courtId) {
            queryBuilder.andWhere('reservation.CourtId = :courtId', { courtId });
        }
        const overlappingReservations = await queryBuilder.getMany();
        return overlappingReservations.length === 0;
    }
    async checkSpecificCourtAvailability(checkAvailabilityDto) {
        try {
            const { date, time, courtId } = checkAvailabilityDto;
            if (!courtId) {
                console.log('No courtId provided for availability check');
                return false;
            }
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (!timeRegex.test(time)) {
                console.error('Invalid time format in checkSpecificCourtAvailability:', time);
                return false;
            }
            const reservationDate = new Date(date);
            reservationDate.setHours(0, 0, 0, 0);
            const newStartTime = time;
            const newEndTime = this.calculateEndTime(time);
            const court = await this.courtService.findOne(courtId);
            if (!court) {
                console.log(`Court ${courtId} not found`);
                return false;
            }
            if (!court.IsActive) {
                console.log(`Court ${courtId} is not active`);
                return false;
            }
            const overlappingReservations = await this.reservationsRepository
                .createQueryBuilder('reservation')
                .where('reservation.Date = :date', { date: reservationDate })
                .andWhere('reservation.CourtId = :courtId', { courtId })
                .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2] })
                .andWhere('(reservation.StartTime < :newEndTime AND reservation.EndTime > :newStartTime)', { newStartTime, newEndTime })
                .getMany();
            return overlappingReservations.length === 0;
        }
        catch (error) {
            console.error('Error checking court availability:', error);
            return false;
        }
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
        reservation.Status = 2;
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
        await this.reservationsRepository.remove(reservation);
    }
    async togglePaymentStatus(reservationId) {
        const reservation = await this.reservationsRepository.findOne({
            where: { Id: reservationId }
        });
        if (!reservation) {
            throw new common_1.BadRequestException('Reservation not found');
        }
        reservation.Status = reservation.Status === 1 ? 2 : 1;
        reservation.IsPaid = reservation.Status === 2;
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
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) {
                console.error('Invalid time components in calculateEndTime:', startTime);
                throw new Error(`Invalid time format: ${startTime}`);
            }
            const totalMinutes = hours * 60 + minutes + 90;
            const endHours = Math.floor(totalMinutes / 60);
            const endMinutes = totalMinutes % 60;
            return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        }
        catch (error) {
            console.error('Error calculating end time:', error);
            throw error;
        }
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
        const assignments = await this.getCourtAssignments(date, time);
        const availableCourts = assignments[stadiumType]?.available || [];
        if (availableCourts.length === 0) {
            return null;
        }
        const selectedCourt = availableCourts[0];
        const allCourts = await this.courtService.findActive();
        return allCourts.find(court => court.Id === selectedCourt.courtId);
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
    async getMonthlyStats(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const reservations = await this.reservationsRepository.find({
            where: {
                Date: (0, typeorm_2.Between)(startDate, endDate),
                Status: 2
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
    async getAvailableStadiumTypes(date, time) {
        try {
            console.log('Checking stadium availability for:', { date, time });
            if (!date || !time) {
                console.error('Missing date or time');
                throw new common_1.BadRequestException('Date and time are required');
            }
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (!timeRegex.test(time)) {
                console.error('Invalid time format:', time);
                throw new common_1.BadRequestException(`Invalid time format: ${time}. Expected HH:MM`);
            }
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                console.error('Invalid date format:', date);
                throw new common_1.BadRequestException(`Invalid date format: ${date}`);
            }
            const allCourts = await this.courtService.findActive();
            console.log('All courts found:', allCourts.length, allCourts.map(c => ({ id: c.Id, name: c.Name, stadiumType: c.StadiumType })));
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
            console.log('Indoor courts:', indoorCourts.length, indoorCourts.map(c => c.Name));
            console.log('Outdoor courts:', outdoorCourts.length, outdoorCourts.map(c => c.Name));
            const checkTypeAvailability = async (courts) => {
                const availableCourts = [];
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
                    courts: availableCourts.length,
                    availableCourts
                };
            };
            const [indoorAvailability, outdoorAvailability] = await Promise.all([
                checkTypeAvailability(indoorCourts),
                checkTypeAvailability(outdoorCourts)
            ]);
            console.log('Final availability:', {
                indoor: { total: indoorCourts.length, available: indoorAvailability.courts },
                outdoor: { total: outdoorCourts.length, available: outdoorAvailability.courts }
            });
            return {
                indoor: indoorAvailability,
                outdoor: outdoorAvailability
            };
        }
        catch (error) {
            console.error('Error in getAvailableStadiumTypes:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to check stadium availability. Please try again.');
        }
    }
    async getCourtAssignments(date, time) {
        const reservationDate = new Date(date);
        const endTime = this.calculateEndTime(time);
        const overlappingReservations = await this.reservationsRepository
            .createQueryBuilder('reservation')
            .leftJoinAndSelect('reservation.court', 'court')
            .where('reservation.Date = :date', { date: reservationDate })
            .andWhere('reservation.Status IN (:...statuses)', { statuses: [1, 2, 4] })
            .andWhere('(reservation.StartTime < :endTime AND reservation.EndTime > :startTime)', { startTime: time, endTime })
            .getMany();
        const allCourts = await this.courtService.findActive();
        const assignments = {
            indoor: {
                total: allCourts.filter(c => c.StadiumType === 'indoor').length,
                occupied: [],
                available: []
            },
            outdoor: {
                total: allCourts.filter(c => c.StadiumType === 'outdoor').length,
                occupied: [],
                available: []
            }
        };
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
        for (const court of allCourts) {
            const isAvailable = await this.checkSpecificCourtAvailability({
                date,
                time,
                courtId: court.Id
            });
            if (isAvailable) {
                assignments[court.StadiumType].available.push({
                    courtId: court.Id,
                    courtName: court.Name,
                    sportType: court.SportType
                });
            }
        }
        return assignments;
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