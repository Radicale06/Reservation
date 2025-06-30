import { IsDateString, IsNotEmpty, Matches, IsOptional, IsNumber } from 'class-validator';

export class CheckAvailabilityDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format'
  })
  time: string;

  @IsOptional()
  @IsNumber()
  courtId?: number;
}