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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("../account/entities/account.entity");
let AuthService = class AuthService {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async login(loginDto) {
        console.log('Login attempt with:', loginDto);
        const allAccounts = await this.accountRepository.find();
        console.log('All accounts in database:', allAccounts);
        const account = await this.accountRepository.findOne({
            where: {
                UserName: loginDto.username,
                Password: loginDto.password,
            },
        });
        console.log('Found account:', account);
        if (!account) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return {
            id: account.Id,
            username: account.UserName,
            fullName: account.FullName,
            token: Buffer.from(`${account.Id}:${account.UserName}`).toString('base64'),
        };
    }
    async validateUser(userId) {
        const account = await this.accountRepository.findOne({
            where: { Id: userId },
        });
        if (!account) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return account;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map