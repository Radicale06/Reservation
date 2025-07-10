import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Court } from './entities/court.entity';

@Injectable()
export class CourtService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
  ) {}

  async findAll() {
    return this.courtRepository.find({
      order: { Name: 'ASC' },
    });
  }

  async findActive() {
    const courts = await this.courtRepository.find({
      where: { IsActive: true },
      order: { Name: 'ASC' },
    });
    
    // Normalize legacy courts without StadiumType
    return courts.map(court => {
      if (!court.StadiumType) {
        // Infer from Type field or default to outdoor
        if (court.Type && court.Type.toLowerCase().includes('indoor')) {
          court.StadiumType = 'indoor';
        } else {
          court.StadiumType = 'outdoor';
        }
      }
      
      if (!court.SportType) {
        court.SportType = 'padel';
      }
      
      return court;
    });
  }

  async findOne(id: number) {
    return this.courtRepository.findOne({
      where: { Id: id },
    });
  }

  async create(court: Partial<Court>) {
    const newCourt = this.courtRepository.create({
      ...court,
      CreatedAt: new Date(),
    });
    return this.courtRepository.save(newCourt);
  }

  async update(id: number, court: Partial<Court>) {
    await this.courtRepository.update(id, court);
    return this.findOne(id);
  }

  async toggleActive(id: number) {
    const court = await this.findOne(id);
    if (court) {
      court.IsActive = !court.IsActive;
      return this.courtRepository.save(court);
    }
    return null;
  }
}