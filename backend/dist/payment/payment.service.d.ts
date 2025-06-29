import { KonnectService } from './services/konnect.service';
import { FlouciService } from './services/flouci.service';
import { InitPaymentDto, PaymentGateway } from './dto/payment.dto';
import { PaymentResponse } from './interfaces/payment-gateway.interface';
export declare class PaymentService {
    private konnectService;
    private flouciService;
    constructor(konnectService: KonnectService, flouciService: FlouciService);
    initPayment(initPaymentDto: InitPaymentDto): Promise<PaymentResponse>;
    verifyPayment(paymentId: string, gateway: PaymentGateway): Promise<{
        success: boolean;
        status: string;
    }>;
}
