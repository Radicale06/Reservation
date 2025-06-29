import { PaymentService } from './payment.service';
import { InitPaymentDto, PaymentGateway } from './dto/payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    initPayment(initPaymentDto: InitPaymentDto): Promise<import("./interfaces/payment-gateway.interface").PaymentResponse>;
    verifyPayment(gateway: PaymentGateway, paymentId: string): Promise<{
        success: boolean;
        status: string;
    }>;
    konnectWebhook(webhookData: any): Promise<{
        status: string;
    }>;
    flouciWebhook(webhookData: any): Promise<{
        status: string;
    }>;
}
