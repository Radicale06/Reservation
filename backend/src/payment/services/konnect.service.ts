import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  PaymentGatewayInterface,
  PaymentResponse,
} from '../interfaces/payment-gateway.interface';

@Injectable()
export class KonnectService implements PaymentGatewayInterface {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>(
      'KONNECT_API_URL',
      'https://api.sandbox.konnect.network/api/v2/',
    );
    this.apiKey = this.configService.get<string>('KONNECT_API_KEY', '');
  }

  async initPayment(
    amount: number,
    reservationId: number,
    successUrl: string,
    failUrl: string,
  ): Promise<PaymentResponse> {
    try {
      const paymentData = {
        receiverWalletId: this.configService.get<string>('KONNECT_WALLET_ID'),
        amount: amount * 1000, // Convert to millimes (Tunisian currency subdivision)
        token: this.apiKey,
        orderId: `reservation_${reservationId}`,
        description: `Réservation terrain padel - ${reservationId}`,
        acceptUrl: successUrl,
        cancelUrl: failUrl,
        webhook: `${this.configService.get<string>('APP_URL')}/api/payment/webhook/konnect`,
        silentWebhook: true,
        theme: 'light',
      };

      const response = await axios.post(
        `${this.apiUrl}/v2/payments/init-payment`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

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
    } catch (error) {
      console.error(
        'Konnect payment error:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initialization failed',
      };
    }
  }

  async verifyPayment(
    paymentId: string,
  ): Promise<{ success: boolean; status: string }> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v2/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return {
        success: response.data.status === 'completed',
        status: response.data.status,
      };
    } catch (error) {
      console.error(
        'Konnect verification error:',
        error.response?.data || error.message,
      );
      return {
        success: false,
        status: 'failed',
      };
    }
  }
}
