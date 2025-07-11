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
    try {
      const courts = await this.courtRepository.find({
        where: { IsActive: true },
        order: { Name: 'ASC' },
      });
      
      console.log(`Found ${courts.length} active courts`);
      
      // Normalize legacy courts without StadiumType
      const normalizedCourts = courts.map(court => {
        if (!court.StadiumType) {
          // Infer from Type field or default to outdoor
          if (court.Type && court.Type.toLowerCase().includes('indoor')) {
            court.StadiumType = 'indoor';
            console.log(`Court ${court.Name} (ID: ${court.Id}): Inferred StadiumType as 'indoor' from Type field`);
          } else {
            court.StadiumType = 'outdoor';
            console.log(`Court ${court.Name} (ID: ${court.Id}): Defaulted StadiumType to 'outdoor'`);
          }
        }
        
        if (!court.SportType) {
          court.SportType = 'padel';
          console.log(`Court ${court.Name} (ID: ${court.Id}): Defaulted SportType to 'padel'`);
        }
        
        return court;
      });
      
      console.log('Active courts by stadium type:', {
        indoor: normalizedCourts.filter(c => c.StadiumType === 'indoor').length,
        outdoor: normalizedCourts.filter(c => c.StadiumType === 'outdoor').length
      });
      
      return normalizedCourts;
    } catch (error) {
      console.error('Error fetching active courts:', error);
      throw error;
    }
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