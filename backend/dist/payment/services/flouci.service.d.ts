import { ConfigService } from '@nestjs/config';
import { PaymentGatewayInterface, PaymentResponse } from '../interfaces/payment-gateway.interface';
export declare class FlouciService implements PaymentGatewayInterface {
    private configService;
    private readonly apiUrl;
    private readonly appToken;
    private readonly appSecret;
    constructor(configService: ConfigService);
    initPayment(amount: number, reservationId: number, successUrl: string, failUrl: string): Promise<PaymentResponse>;
    verifyPayment(paymentId: string): Promise<{
        success: boolean;
        status: string;
    }>;
}
