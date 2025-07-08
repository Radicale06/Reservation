import { IsNotEmpty, IsString, IsDateString, Matches, IsOptional, IsNumber, IsBoolean, IsEmail, Min, Max, IsIn } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  PlayerFullName: string;

  @IsNotEmpty()
  @IsString()
  PlayerPhone: string;

  @IsOptional()
  @IsEmail()
  PlayerEmail?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsIn([2, 4], { message: 'Number of players must be either 2 or 4' })
  NumberOfPlayers: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['indoor', 'outdoor'])
  StadiumType: string;

  @IsOptional()
  @IsNumber()
  CourtId?: number;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format'
  })
  StartTime: string;

  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format'
  })
  EndTime?: string;

  @IsNotEmpty()
  @IsDateString()
  Date: string;

  @IsNotEmpty()
  @IsNumber()
  Price: number;

  @IsNotEmpty()
  @IsNumber()
  Status: number;

  @IsOptional()
  @IsBoolean()
  IsPaid?: boolean;

  @IsNotEmpty()
  @IsString()
  CreatedBy: string;
}