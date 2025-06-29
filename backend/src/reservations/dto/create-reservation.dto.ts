import { IsEmail, IsNotEmpty, IsString, IsDateString, Matches, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsDateString()
  reservationDate: string;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format'
  })
  startTime: string;

  @IsOptional()
  @IsString()
  paymentId?: string;
}