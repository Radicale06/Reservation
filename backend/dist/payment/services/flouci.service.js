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
exports.FlouciService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let FlouciService = class FlouciService {
    configService;
    apiUrl;
    appToken;
    appSecret;
    constructor(configService) {
        this.configService = configService;
        this.apiUrl = this.configService.get('FLOUCI_API_URL', 'https://developers.flouci.com/api');
        this.appToken = this.configService.get('FLOUCI_APP_TOKEN', '');
        this.appSecret = this.configService.get('FLOUCI_APP_SECRET', '');
    }
    async initPayment(amount, reservationId, successUrl, failUrl) {
        try {
            const paymentData = {
                app_token: this.appToken,
                app_secret: this.appSecret,
                amount: amount,
                accept_url: successUrl,
                cancel_url: failUrl,
                webhook_url: `${this.configService.get('APP_URL')}/api/payment/webhook/flouci`,
                session_timeout_secs: 1200,
                success_url: successUrl,
                fail_url: failUrl,
                developer_tracking_id: `reservation_${reservationId}`
            };
            const response = await axios_1.default.post(`${this.apiUrl}/generate_payment`, paymentData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.data && response.data.result && response.data.result.link) {
                return {
                    success: true,
                    paymentUrl: response.data.result.link,
                    paymentId: response.data.result.payment_id
                };
            }
            return {
                success: false,
                error: 'Failed to initialize payment'
            };
        }
        catch (error) {
            console.error('Flouci payment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment initialization failed'
            };
        }
    }
    async verifyPayment(paymentId) {
        try {
            const verificationData = {
                app_token: this.appToken,
                app_secret: this.appSecret,
                payment_id: paymentId
            };
            const response = await axios_1.default.post(`${this.apiUrl}/verify_payment`, verificationData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const isSuccess = response.data && response.data.result && response.data.result.status === 'SUCCESS';
            return {
                success: isSuccess,
                status: response.data.result?.status || 'FAILED'
            };
        }
        catch (error) {
            console.error('Flouci verification error:', error.response?.data || error.message);
            return {
                success: false,
                status: 'FAILED'
            };
        }
    }
};
exports.FlouciService = FlouciService;
exports.FlouciService = FlouciService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FlouciService);
//# sourceMappingURL=flouci.service.js.map