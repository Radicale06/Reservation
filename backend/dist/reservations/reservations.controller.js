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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("./reservations.service");
const create_reservation_dto_1 = require("./dto/create-reservation.dto");
const check_availability_dto_1 = require("./dto/check-availability.dto");
let ReservationsController = class ReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    create(createReservationDto) {
        return this.reservationsService.create(createReservationDto);
    }
    findAll() {
        console.log('Reservations findAll called');
        return this.reservationsService.findAll();
    }
    test() {
        return { message: 'Reservations endpoint working', timestamp: new Date().toISOString() };
    }
    getAvailableSlots(date, courtId) {
        return this.reservationsService.getAvailableSlots(date, courtId ? +courtId : undefined);
    }
    checkAvailability(checkAvailabilityDto) {
        return this.reservationsService.checkAvailability(checkAvailabilityDto);
    }
    getCalendarData(startDate, endDate) {
        return this.reservationsService.findByDateRange(new Date(startDate), new Date(endDate));
    }
    getDailyStats(date) {
        return this.reservationsService.getDailyStats(new Date(date));
    }
    getMonthlyStats(year, month) {
        return this.reservationsService.getMonthlyStats(+year, +month);
    }
    async getStadiumAvailability(date, time) {
        try {
            console.log('Stadium availability request:', { date, time });
            if (!date || !time) {
                throw new common_1.BadRequestException('Date and time are required');
            }
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
            if (!timeRegex.test(time)) {
                throw new common_1.BadRequestException(`Invalid time format: '${time}'. Expected HH:MM`);
            }
            console.log('Processing stadium availability for:', { date, time });
            const result = await this.reservationsService.getAvailableStadiumTypes(date, time);
            console.log('Stadium availability result:', result);
            return result;
        }
        catch (error) {
            console.error('Error in stadium availability endpoint:', error);
            return {
                indoor: { available: true, courts: 1, availableCourts: [] },
                outdoor: { available: true, courts: 2, availableCourts: [] }
            };
        }
    }
    getCourtAssignments(date, time) {
        return this.reservationsService.getCourtAssignments(date, time);
    }
    async debugAvailability(date, time) {
        console.log('Debug availability for:', { date, time });
        const result = await this.reservationsService.getAvailableStadiumTypes(date, time);
        console.log('Result:', result);
        return result;
    }
    confirmPayment(id, paymentId) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new common_1.BadRequestException('Invalid reservation ID');
        }
        return this.reservationsService.confirmPayment(numericId, paymentId);
    }
    findOne(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new common_1.BadRequestException('Invalid reservation ID');
        }
        return this.reservationsService.findById(numericId);
    }
    cancel(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new common_1.BadRequestException('Invalid reservation ID');
        }
        return this.reservationsService.cancelReservation(numericId);
    }
    updateCourt(id, courtId) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new common_1.BadRequestException('Invalid reservation ID');
        }
        return this.reservationsService.updateCourtAssignment(numericId, courtId);
    }
    togglePaymentStatus(id) {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
            throw new common_1.BadRequestException('Invalid reservation ID');
        }
        return this.reservationsService.togglePaymentStatus(numericId);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reservation_dto_1.CreateReservationDto]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('available-slots'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('courtId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getAvailableSlots", null);
__decorate([
    (0, common_1.Post)('check-availability'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_availability_dto_1.CheckAvailabilityDto]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "checkAvailability", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getCalendarData", null);
__decorate([
    (0, common_1.Get)('stats/daily'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getDailyStats", null);
__decorate([
    (0, common_1.Get)('stats/monthly'),
    __param(0, (0, common_1.Query)('year')),
    __param(1, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getMonthlyStats", null);
__decorate([
    (0, common_1.Get)('stadium-availability'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('time')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getStadiumAvailability", null);
__decorate([
    (0, common_1.Get)('court-assignments'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('time')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "getCourtAssignments", null);
__decorate([
    (0, common_1.Get)('debug-availability'),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('time')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "debugAvailability", null);
__decorate([
    (0, common_1.Post)(':id/confirm-payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/court'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('courtId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "updateCourt", null);
__decorate([
    (0, common_1.Put)(':id/toggle-payment'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReservationsController.prototype, "togglePaymentStatus", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map