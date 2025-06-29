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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const konnect_service_1 = require("./services/konnect.service");
const flouci_service_1 = require("./services/flouci.service");
const payment_dto_1 = require("./dto/payment.dto");
let PaymentService = class PaymentService {
    konnectService;
    flouciService;
    constructor(konnectService, flouciService) {
        this.konnectService = konnectService;
        this.flouciService = flouciService;
    }
    async initPayment(initPaymentDto) {
        const { amount, reservationId, gateway, successUrl, failUrl } = initPaymentDto;
        switch (gateway) {
            case payment_dto_1.PaymentGateway.KONNECT:
                return this.konnectService.initPayment(amount, reservationId, successUrl, failUrl);
            case payment_dto_1.PaymentGateway.FLOUCI:
                return this.flouciService.initPayment(amount, reservationId, successUrl, failUrl);
            default:
                throw new common_1.BadRequestException('Unsupported payment gateway');
        }
    }
    async verifyPayment(paymentId, gateway) {
        switch (gateway) {
            case payment_dto_1.PaymentGateway.KONNECT:
                return this.konnectService.verifyPayment(paymentId);
            case payment_dto_1.PaymentGateway.FLOUCI:
                return this.flouciService.verifyPayment(paymentId);
            default:
                throw new common_1.BadRequestException('Unsupported payment gateway');
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [konnect_service_1.KonnectService,
        flouci_service_1.FlouciService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map