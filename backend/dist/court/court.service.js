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
exports.CourtService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const court_entity_1 = require("./entities/court.entity");
let CourtService = class CourtService {
    courtRepository;
    constructor(courtRepository) {
        this.courtRepository = courtRepository;
    }
    async findAll() {
        return this.courtRepository.find({
            order: { Name: 'ASC' },
        });
    }
    async findActive() {
        try {
            const courts = await this.courtRepository.find({
                where: { IsActive: true },
                order: { Name: 'ASC' },
            });
            console.log(`Found ${courts.length} active courts`);
            const normalizedCourts = courts.map(court => {
                if (!court.StadiumType) {
                    if (court.Type && court.Type.toLowerCase().includes('indoor')) {
                        court.StadiumType = 'indoor';
                        console.log(`Court ${court.Name} (ID: ${court.Id}): Inferred StadiumType as 'indoor' from Type field`);
                    }
                    else {
                        court.StadiumType = 'outdoor';
                        console.log(`Court ${court.Name} (ID: ${court.Id}): Defaulted StadiumType to 'outdoor'`);
                    }
                }
                if (!court.SportType) {
                    court.SportType = 'padel';
                    console.log(`Court ${court.Name} (ID: ${court.Id}): Defaulted SportType to 'padel'`);
                }
                return court;
            });
            console.log('Active courts by stadium type:', {
                indoor: normalizedCourts.filter(c => c.StadiumType === 'indoor').length,
                outdoor: normalizedCourts.filter(c => c.StadiumType === 'outdoor').length
            });
            return normalizedCourts;
        }
        catch (error) {
            console.error('Error fetching active courts:', error);
            throw error;
        }
    }
    async findOne(id) {
        return this.courtRepository.findOne({
            where: { Id: id },
        });
    }
    async create(court) {
        const newCourt = this.courtRepository.create({
            ...court,
            CreatedAt: new Date(),
        });
        return this.courtRepository.save(newCourt);
    }
    async update(id, court) {
        await this.courtRepository.update(id, court);
        return this.findOne(id);
    }
    async toggleActive(id) {
        const court = await this.findOne(id);
        if (court) {
            court.IsActive = !court.IsActive;
            return this.courtRepository.save(court);
        }
        return null;
    }
};
exports.CourtService = CourtService;
exports.CourtService = CourtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(court_entity_1.Court)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CourtService);
//# sourceMappingURL=court.service.js.map