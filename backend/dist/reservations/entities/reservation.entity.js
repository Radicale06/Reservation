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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = void 0;
const typeorm_1 = require("typeorm");
const court_entity_1 = require("../../court/entities/court.entity");
let Reservation = class Reservation {
    Id;
    PlayerFullName;
    PlayerPhone;
    CourtId;
    court;
    StartTime;
    EndTime;
    Date;
    Price;
    Status;
    IsPaid;
    CreatedAt;
    CreatedBy;
};
exports.Reservation = Reservation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reservation.prototype, "Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Reservation.prototype, "PlayerFullName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Reservation.prototype, "PlayerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Reservation.prototype, "CourtId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => court_entity_1.Court),
    (0, typeorm_1.JoinColumn)({ name: 'CourtId' }),
    __metadata("design:type", court_entity_1.Court)
], Reservation.prototype, "court", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Reservation.prototype, "StartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Reservation.prototype, "EndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Reservation.prototype, "Date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 3 }),
    __metadata("design:type", Number)
], Reservation.prototype, "Price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Reservation.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: false }),
    __metadata("design:type", Boolean)
], Reservation.prototype, "IsPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Reservation.prototype, "CreatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Reservation.prototype, "CreatedBy", void 0);
exports.Reservation = Reservation = __decorate([
    (0, typeorm_1.Entity)('Reservation')
], Reservation);
//# sourceMappingURL=reservation.entity.js.map