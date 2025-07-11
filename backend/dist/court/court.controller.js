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
exports.CourtController = void 0;
const common_1 = require("@nestjs/common");
const court_service_1 = require("./court.service");
const create_court_dto_1 = require("./dto/create-court.dto");
const update_court_dto_1 = require("./dto/update-court.dto");
let CourtController = class CourtController {
    courtService;
    constructor(courtService) {
        this.courtService = courtService;
    }
    async findAll() {
        try {
            const courts = await this.courtService.findAll();
            console.log('Court controller - Total courts:', courts.length);
            return courts;
        }
        catch (error) {
            console.error('Error fetching courts:', error);
            throw error;
        }
    }
    test() {
        return { message: 'Courts endpoint working', timestamp: new Date().toISOString() };
    }
    async findActive() {
        return this.courtService.findActive();
    }
    async findOne(id) {
        return this.courtService.findOne(+id);
    }
    async create(court) {
        return this.courtService.create(court);
    }
    async update(id, court) {
        return this.courtService.update(+id, court);
    }
    async toggleActive(id) {
        return this.courtService.toggleActive(+id);
    }
    async debug() {
        const courts = await this.courtService.findAll();
        return {
            totalCourts: courts.length,
            courts: courts.map(court => ({
                id: court.Id,
                name: court.Name,
                type: court.Type,
                stadiumType: court.StadiumType,
                sportType: court.SportType,
                isActive: court.IsActive
            }))
        };
    }
    async debugActive() {
        const courts = await this.courtService.findActive();
        const indoor = courts.filter(c => c.StadiumType === 'indoor');
        const outdoor = courts.filter(c => c.StadiumType === 'outdoor');
        return {
            totalActive: courts.length,
            byType: {
                indoor: {
                    count: indoor.length,
                    courts: indoor.map(c => ({ id: c.Id, name: c.Name }))
                },
                outdoor: {
                    count: outdoor.length,
                    courts: outdoor.map(c => ({ id: c.Id, name: c.Name }))
                }
            },
            allCourts: courts.map(court => ({
                id: court.Id,
                name: court.Name,
                stadiumType: court.StadiumType,
                sportType: court.SportType,
                isActive: court.IsActive
            }))
        };
    }
    async seedCourts() {
        const existingCourts = await this.courtService.findAll();
        if (existingCourts.length === 0) {
            const sampleCourts = [
                {
                    Name: 'Terrain Padel Extérieur 1',
                    Description: 'Terrain de padel extérieur principal',
                    Type: 'Court',
                    StadiumType: 'outdoor',
                    SportType: 'padel',
                    IsActive: true
                },
                {
                    Name: 'Terrain Padel Extérieur 2',
                    Description: 'Terrain de padel extérieur secondaire',
                    Type: 'Court',
                    StadiumType: 'outdoor',
                    SportType: 'padel',
                    IsActive: true
                },
                {
                    Name: 'Terrain Padel Intérieur 1',
                    Description: 'Terrain de padel intérieur climatisé',
                    Type: 'Court',
                    StadiumType: 'indoor',
                    SportType: 'padel',
                    IsActive: true
                }
            ];
            const createdCourts = [];
            for (const courtData of sampleCourts) {
                const court = await this.courtService.create(courtData);
                createdCourts.push(court);
            }
            return {
                message: 'Sample courts created successfully',
                courts: createdCourts
            };
        }
        else {
            return {
                message: 'Courts already exist',
                count: existingCourts.length
            };
        }
    }
    async activateAllCourts() {
        const allCourts = await this.courtService.findAll();
        const updatedCourts = [];
        for (const court of allCourts) {
            if (!court.IsActive) {
                const updated = await this.courtService.update(court.Id, { IsActive: true });
                updatedCourts.push(updated);
            }
        }
        return {
            message: `Activated ${updatedCourts.length} courts`,
            activatedCourts: updatedCourts.map(c => ({ id: c.Id, name: c.Name })),
            totalCourts: allCourts.length
        };
    }
};
exports.CourtController = CourtController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CourtController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_court_dto_1.CreateCourtDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_court_dto_1.UpdateCourtDto]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/toggle-active'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Get)('debug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "debug", null);
__decorate([
    (0, common_1.Get)('debug/active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "debugActive", null);
__decorate([
    (0, common_1.Post)('seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "seedCourts", null);
__decorate([
    (0, common_1.Post)('activate-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourtController.prototype, "activateAllCourts", null);
exports.CourtController = CourtController = __decorate([
    (0, common_1.Controller)('courts'),
    __metadata("design:paramtypes", [court_service_1.CourtService])
], CourtController);
//# sourceMappingURL=court.controller.js.map