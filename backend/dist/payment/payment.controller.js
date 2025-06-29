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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const payment_dto_1 = require("./dto/payment.dto");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async initPayment(initPaymentDto) {
        return this.paymentService.initPayment(initPaymentDto);
    }
    async verifyPayment(gateway, paymentId) {
        return this.paymentService.verifyPayment(paymentId, gateway);
    }
    async konnectWebhook(webhookData) {
        console.log('Konnect webhook received:', webhookData);
        const { payment_id, order_id, status } = webhookData;
        if (status === 'completed') {
        }
        return { status: 'ok' };
    }
    async flouciWebhook(webhookData) {
        console.log('Flouci webhook received:', webhookData);
        const { payment_id, developer_tracking_id, status } = webhookData;
        if (status === 'SUCCESS') {
        }
        return { status: 'ok' };
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('init'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.InitPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "initPayment", null);
__decorate([
    (0, common_1.Get)('verify/:gateway/:paymentId'),
    __param(0, (0, common_1.Param)('gateway')),
    __param(1, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Post)('webhook/konnect'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "konnectWebhook", null);
__decorate([
    (0, common_1.Post)('webhook/flouci'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "flouciWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map