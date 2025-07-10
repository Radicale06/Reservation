import { Controller, Get, Put, Body, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async getCompany() {
    return this.companyService.findOne();
  }

  @Put()
  async updateCompany(@Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(updateCompanyDto);
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    return this.companyService.updateLogo(file.buffer);
  }

  @Get('public')
  async getPublicCompanyInfo() {
    const company = await this.companyService.findOne();
    
    // Return only public information
    return {
      name: company.Company,
      raisonSociale: company.RaisonSociale,
      phone: company.Phone,
      address: company.Address,
      hasLogo: !!company.Logo
    };
  }
}