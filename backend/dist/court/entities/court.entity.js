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
exports.Court = void 0;
const typeorm_1 = require("typeorm");
let Court = class Court {
    Id;
    Name;
    Description;
    Type;
    StadiumType;
    SportType;
    Image;
    IsActive;
    CreatedAt;
};
exports.Court = Court;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Court.prototype, "Id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Court.prototype, "Name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Court.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Court.prototype, "Type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'outdoor' }),
    __metadata("design:type", String)
], Court.prototype, "StadiumType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'padel' }),
    __metadata("design:type", String)
], Court.prototype, "SportType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'blob', nullable: true }),
    __metadata("design:type", Buffer)
], Court.prototype, "Image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Court.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Court.prototype, "CreatedAt", void 0);
exports.Court = Court = __decorate([
    (0, typeorm_1.Entity)('Court')
], Court);
//# sourceMappingURL=court.entity.js.map