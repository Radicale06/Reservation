import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty()
  @IsString()
  Company: string;

  @IsOptional()
  @IsString()
  RaisonSociale?: string;

  @IsNotEmpty()
  @IsString()
  TaxIdentificationNumber: string;

  @IsNotEmpty()
  @IsString()
  Address: string;

  @IsNotEmpty()
  @IsString()
  Phone: string;
}