import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async findOne(): Promise<Company> {
    let company = await this.companyRepository.findOne({
      where: {},
      order: { Id: 'ASC' }
    });

    if (!company) {
      // Create default company if none exists
      company = await this.companyRepository.save({
        Company: 'Réservation Padel',
        RaisonSociale: '',
        TaxIdentificationNumber: '',
        Address: '',
        Phone: '',
      });
    }

    return company;
  }

  async update(updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne();
    
    Object.assign(company, updateCompanyDto);
    
    return this.companyRepository.save(company);
  }

  async updateLogo(logo: Buffer): Promise<Company> {
    const company = await this.findOne();
    company.Logo = logo;
    return this.companyRepository.save(company);
  }
}