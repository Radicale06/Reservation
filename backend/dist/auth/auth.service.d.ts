import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private accountRepository;
    constructor(accountRepository: Repository<Account>);
    login(loginDto: LoginDto): Promise<{
        id: number;
        username: string;
        fullName: string;
        token: string;
    }>;
    validateUser(userId: number): Promise<Account>;
}
