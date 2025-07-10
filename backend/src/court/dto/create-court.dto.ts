import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateCourtDto {
  @IsNotEmpty()
  @IsString()
  Name: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsNotEmpty()
  @IsString()
  Type: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['indoor', 'outdoor'])
  StadiumType: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['padel', 'tennis', 'football', 'basketball', 'volleyball'])
  SportType: string;

  @IsOptional()
  Image?: Buffer;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}