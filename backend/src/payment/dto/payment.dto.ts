import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';

export enum PaymentGateway {
  KONNECT = 'konnect',
  FLOUCI = 'flouci'
}

export class InitPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  reservationId: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @IsNotEmpty()
  @IsString()
  successUrl: string;

  @IsNotEmpty()
  @IsString()
  failUrl: string;
}

export class PaymentCallbackDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsNumber()
  reservationId: number;
}