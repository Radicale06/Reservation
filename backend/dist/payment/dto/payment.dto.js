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
exports.PaymentCallbackDto = exports.InitPaymentDto = exports.PaymentGateway = void 0;
const class_validator_1 = require("class-validator");
var PaymentGateway;
(function (PaymentGateway) {
    PaymentGateway["KONNECT"] = "konnect";
    PaymentGateway["FLOUCI"] = "flouci";
})(PaymentGateway || (exports.PaymentGateway = PaymentGateway = {}));
class InitPaymentDto {
    reservationId;
    amount;
    gateway;
    successUrl;
    failUrl;
}
exports.InitPaymentDto = InitPaymentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitPaymentDto.prototype, "reservationId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], InitPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(PaymentGateway),
    __metadata("design:type", String)
], InitPaymentDto.prototype, "gateway", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitPaymentDto.prototype, "successUrl", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitPaymentDto.prototype, "failUrl", void 0);
class PaymentCallbackDto {
    paymentId;
    status;
    reservationId;
}
exports.PaymentCallbackDto = PaymentCallbackDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "paymentId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentCallbackDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PaymentCallbackDto.prototype, "reservationId", void 0);
//# sourceMappingURL=payment.dto.js.map