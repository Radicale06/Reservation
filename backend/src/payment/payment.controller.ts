import { Controller, Post, Body, Param, Get, Query, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitPaymentDto, PaymentGateway } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('init')
  async initPayment(@Body(ValidationPipe) initPaymentDto: InitPaymentDto) {
    return this.paymentService.initPayment(initPaymentDto);
  }

  @Get('verify/:gateway/:paymentId')
  async verifyPayment(
    @Param('gateway') gateway: PaymentGateway,
    @Param('paymentId') paymentId: string
  ) {
    return this.paymentService.verifyPayment(paymentId, gateway);
  }

  @Post('webhook/konnect')
  async konnectWebhook(@Body() webhookData: any) {
    // Handle Konnect webhook
    console.log('Konnect webhook received:', webhookData);
    
    // Extract payment information and update reservation status
    const { payment_id, order_id, status } = webhookData;
    
    if (status === 'completed') {
      // Update reservation status to confirmed
      // You can emit an event here or call the reservations service directly
    }
    
    return { status: 'ok' };
  }

  @Post('webhook/flouci')
  async flouciWebhook(@Body() webhookData: any) {
    // Handle Flouci webhook
    console.log('Flouci webhook received:', webhookData);
    
    // Extract payment information and update reservation status
    const { payment_id, developer_tracking_id, status } = webhookData;
    
    if (status === 'SUCCESS') {
      // Update reservation status to confirmed
      // You can emit an event here or call the reservations service directly
    }
    
    return { status: 'ok' };
  }
}