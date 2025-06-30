import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async login(loginDto: LoginDto) {
    console.log('Login attempt with:', loginDto);
    
    // First, let's check if we can find any accounts at all
    const allAccounts = await this.accountRepository.find();
    console.log('All accounts in database:', allAccounts);
    
    const account = await this.accountRepository.findOne({
      where: {
        UserName: loginDto.username,
        Password: loginDto.password,
      },
    });

    console.log('Found account:', account);

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: account.Id,
      username: account.UserName,
      fullName: account.FullName,
      token: Buffer.from(`${account.Id}:${account.UserName}`).toString('base64'),
    };
  }

  async validateUser(userId: number) {
    const account = await this.accountRepository.findOne({
      where: { Id: userId },
    });

    if (!account) {
      throw new UnauthorizedException('User not found');
    }

    return account;
  }
}