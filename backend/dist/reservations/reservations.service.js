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
let ReservationsService = class ReservationsService {
    reservationsRepository;
    constructor(reservationsRepository) {
        this.reservationsRepository = reservationsRepository;
    }
    async create(createReservationDto) {
        const { reservationDate, startTime } = createReservationDto;
        const isAvailable = await this.checkAvailability({
            date: reservationDate,
            time: startTime
        });
        if (!isAvailable) {
            throw new common_1.BadRequestException('This time slot is already reserved');
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
    async checkAvailability(checkAvailabilityDto) {
        const { date, time } = checkAvailabilityDto;
        const reservationDate = new Date(date);
        const newStartTime = time;
        const newEndTime = this.calculateEndTime(time);
        const overlappingReservations = await this.reservationsRepository
            .createQueryBuilder('reservation')
            .where('reservation.reservationDate = :date', { date: reservationDate })
            .andWhere('reservation.status IN (:...statuses)', { statuses: ['pending', 'confirmed'] })
            .andWhere('(reservation.startTime < :newEndTime AND reservation.endTime > :newStartTime)', { newStartTime, newEndTime })
            .getMany();
        return overlappingReservations.length === 0;
    }
    async getAvailableSlots(date) {
        const reservationDate = new Date(date);
        const allReservations = await this.reservationsRepository
            .createQueryBuilder('reservation')
            .where('reservation.reservationDate = :date', { date: reservationDate })
            .andWhere('reservation.status IN (:...statuses)', { statuses: ['pending', 'confirmed'] })
            .getMany();
        const allSlots = this.generateTimeSlots();
        const unavailableSlots = [];
        for (const reservation of allReservations) {
            const reservationStart = this.timeToMinutes(reservation.startTime);
            const reservationEnd = this.timeToMinutes(reservation.endTime);
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
            order: {
                reservationDate: 'ASC',
                startTime: 'ASC'
            }
        });
    }
    async findByDateRange(startDate, endDate) {
        return this.reservationsRepository.find({
            where: {
                reservationDate: (0, typeorm_2.Between)(startDate, endDate),
                status: 'confirmed'
            },
            order: {
                reservationDate: 'ASC',
                startTime: 'ASC'
            }
        });
    }
    async confirmPayment(reservationId, paymentId, gateway) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id: reservationId }
        });
        if (!reservation) {
            throw new common_1.BadRequestException('Reservation not found');
        }
        reservation.status = 'confirmed';
        reservation.paymentId = paymentId;
        return this.reservationsRepository.save(reservation);
    }
    async cancelReservation(reservationId) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id: reservationId }
        });
        if (!reservation) {
            throw new common_1.BadRequestException('Reservation not found');
        }
        reservation.status = 'cancelled';
        return this.reservationsRepository.save(reservation);
    }
    async findById(id) {
        const reservation = await this.reservationsRepository.findOne({
            where: { id }
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map