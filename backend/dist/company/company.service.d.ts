import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompanyService {
    private companyRepository;
    constructor(companyRepository: Repository<Company>);
    findOne(): Promise<Company>;
    update(updateCompanyDto: UpdateCompanyDto): Promise<Company>;
    updateLogo(logo: Buffer): Promise<Company>;
}
