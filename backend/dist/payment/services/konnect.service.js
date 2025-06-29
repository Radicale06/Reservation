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
exports.KonnectService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let KonnectService = class KonnectService {
    configService;
    apiUrl;
    apiKey;
    constructor(configService) {
        this.configService = configService;
        this.apiUrl = this.configService.get('KONNECT_API_URL', 'https://api.sandbox.konnect.network/api/v2/');
        this.apiKey = this.configService.get('KONNECT_API_KEY', '');
    }
    async initPayment(amount, reservationId, successUrl, failUrl) {
        try {
            const paymentData = {
                receiverWalletId: this.configService.get('KONNECT_WALLET_ID'),
                amount: amount * 1000,
                token: this.apiKey,
                orderId: `reservation_${reservationId}`,
                description: `Réservation terrain padel - ${reservationId}`,
                acceptUrl: successUrl,
                cancelUrl: failUrl,
                webhook: `${this.configService.get('APP_URL')}/api/payment/webhook/konnect`,
                silentWebhook: true,
                theme: 'light',
            };
            const response = await axios_1.default.post(`${this.apiUrl}/v2/payments/init-payment`, paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.data && response.data.payUrl) {
                return {
                    success: true,
                    paymentUrl: response.data.payUrl,
                    paymentId: response.data.paymentRef,
                };
            }
            return {
                success: false,
                error: 'Failed to initialize payment',
            };
        }
        catch (error) {
            console.error('Konnect payment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment initialization failed',
            };
        }
    }
    async verifyPayment(paymentId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/v2/payments/${paymentId}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            return {
                success: response.data.status === 'completed',
                status: response.data.status,
            };
        }
        catch (error) {
            console.error('Konnect verification error:', error.response?.data || error.message);
            return {
                success: false,
                status: 'failed',
            };
        }
    }
};
exports.KonnectService = KonnectService;
exports.KonnectService = KonnectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], KonnectService);
//# sourceMappingURL=konnect.service.js.map