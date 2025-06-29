import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentGatewayInterface, PaymentResponse } from '../interfaces/payment-gateway.interface';

@Injectable()
export class FlouciService implements PaymentGatewayInterface {
  private readonly apiUrl: string;
  private readonly appToken: string;
  private readonly appSecret: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('FLOUCI_API_URL', 'https://developers.flouci.com/api');
    this.appToken = this.configService.get<string>('FLOUCI_APP_TOKEN', '');
    this.appSecret = this.configService.get<string>('FLOUCI_APP_SECRET', '');
  }

  async initPayment(
    amount: number,
    reservationId: number,
    successUrl: string,
    failUrl: string
  ): Promise<PaymentResponse> {
    try {
      const paymentData = {
        app_token: this.appToken,
        app_secret: this.appSecret,
        amount: amount,
        accept_url: successUrl,
        cancel_url: failUrl,
        webhook_url: `${this.configService.get<string>('APP_URL')}/api/payment/webhook/flouci`,
        session_timeout_secs: 1200,
        success_url: successUrl,
        fail_url: failUrl,
        developer_tracking_id: `reservation_${reservationId}`
      };

      const response = await axios.post(
        `${this.apiUrl}/generate_payment`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

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
    } catch (error) {
      console.error('Flouci payment error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment initialization failed'
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<{ success: boolean; status: string }> {
    try {
      const verificationData = {
        app_token: this.appToken,
        app_secret: this.appSecret,
        payment_id: paymentId
      };

      const response = await axios.post(
        `${this.apiUrl}/verify_payment`,
        verificationData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const isSuccess = response.data && response.data.result && response.data.result.status === 'SUCCESS';
      
      return {
        success: isSuccess,
        status: response.data.result?.status || 'FAILED'
      };
    } catch (error) {
      console.error('Flouci verification error:', error.response?.data || error.message);
      return {
        success: false,
        status: 'FAILED'
      };
    }
  }
}