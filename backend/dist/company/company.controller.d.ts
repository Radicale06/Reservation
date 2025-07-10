import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    getCompany(): Promise<import("./entities/company.entity").Company>;
    updateCompany(updateCompanyDto: UpdateCompanyDto): Promise<import("./entities/company.entity").Company>;
    uploadLogo(file: any): Promise<import("./entities/company.entity").Company>;
    getPublicCompanyInfo(): Promise<{
        name: string;
        raisonSociale: string;
        phone: string;
        address: string;
        hasLogo: boolean;
    }>;
}
