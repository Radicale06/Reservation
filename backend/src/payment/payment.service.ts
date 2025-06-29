import { Injectable, BadRequestException } from '@nestjs/common';
import { KonnectService } from './services/konnect.service';
import { FlouciService } from './services/flouci.service';
import { InitPaymentDto, PaymentGateway } from './dto/payment.dto';
import { PaymentResponse } from './interfaces/payment-gateway.interface';

@Injectable()
export class PaymentService {
  constructor(
    private konnectService: KonnectService,
    private flouciService: FlouciService
  ) {}

  async initPayment(initPaymentDto: InitPaymentDto): Promise<PaymentResponse> {
    const { amount, reservationId, gateway, successUrl, failUrl } = initPaymentDto;

    switch (gateway) {
      case PaymentGateway.KONNECT:
        return this.konnectService.initPayment(amount, reservationId, successUrl, failUrl);
      
      case PaymentGateway.FLOUCI:
        return this.flouciService.initPayment(amount, reservationId, successUrl, failUrl);
      
      default:
        throw new BadRequestException('Unsupported payment gateway');
    }
  }

  async verifyPayment(paymentId: string, gateway: PaymentGateway): Promise<{ success: boolean; status: string }> {
    switch (gateway) {
      case PaymentGateway.KONNECT:
        return this.konnectService.verifyPayment(paymentId);
      
      case PaymentGateway.FLOUCI:
        return this.flouciService.verifyPayment(paymentId);
      
      default:
        throw new BadRequestException('Unsupported payment gateway');
    }
  }
}