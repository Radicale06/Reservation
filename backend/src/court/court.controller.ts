import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { CourtService } from './court.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Controller('courts')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Get()
  async findAll() {
    try {
      const courts = await this.courtService.findAll();
      console.log('Court controller - Total courts:', courts.length);
      return courts;
    } catch (error) {
      console.error('Error fetching courts:', error);
      throw error;
    }
  }

  @Get('test')
  test() {
    return { message: 'Courts endpoint working', timestamp: new Date().toISOString() };
  }

  @Get('active')
  async findActive() {
    return this.courtService.findActive();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.courtService.findOne(+id);
  }

  @Post()
  async create(@Body() court: CreateCourtDto) {
    return this.courtService.create(court);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() court: UpdateCourtDto) {
    return this.courtService.update(+id, court);
  }

  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.courtService.toggleActive(+id);
  }

  @Get('debug')
  async debug() {
    const courts = await this.courtService.findAll();
    return {
      totalCourts: courts.length,
      courts: courts.map(court => ({
        id: court.Id,
        name: court.Name,
        type: court.Type,
        stadiumType: court.StadiumType,
        sportType: court.SportType,
        isActive: court.IsActive
      }))
    };
  }

  @Get('debug/active')
  async debugActive() {
    const courts = await this.courtService.findActive();
    const indoor = courts.filter(c => c.StadiumType === 'indoor');
    const outdoor = courts.filter(c => c.StadiumType === 'outdoor');
    
    return {
      totalActive: courts.length,
      byType: {
        indoor: {
          count: indoor.length,
          courts: indoor.map(c => ({ id: c.Id, name: c.Name }))
        },
        outdoor: {
          count: outdoor.length,
          courts: outdoor.map(c => ({ id: c.Id, name: c.Name }))
        }
      },
      allCourts: courts.map(court => ({
        id: court.Id,
        name: court.Name,
        stadiumType: court.StadiumType,
        sportType: court.SportType,
        isActive: court.IsActive
      }))
    };
  }

  @Post('seed')
  async seedCourts() {
    // Add sample courts if none exist
    const existingCourts = await this.courtService.findAll();
    if (existingCourts.length === 0) {
      const sampleCourts = [
        {
          Name: 'Terrain Padel Extérieur 1',
          Description: 'Terrain de padel extérieur principal',
          Type: 'Court',
          StadiumType: 'outdoor',
          SportType: 'padel',
          IsActive: true
        },
        {
          Name: 'Terrain Padel Extérieur 2',
          Description: 'Terrain de padel extérieur secondaire',
          Type: 'Court',
          StadiumType: 'outdoor',
          SportType: 'padel',
          IsActive: true
        },
        {
          Name: 'Terrain Padel Intérieur 1',
          Description: 'Terrain de padel intérieur climatisé',
          Type: 'Court',
          StadiumType: 'indoor',
          SportType: 'padel',
          IsActive: true
        }
      ];

      const createdCourts: any[] = [];
      for (const courtData of sampleCourts) {
        const court = await this.courtService.create(courtData);
        createdCourts.push(court);
      }

      return {
        message: 'Sample courts created successfully',
        courts: createdCourts
      };
    } else {
      return {
        message: 'Courts already exist',
        count: existingCourts.length
      };
    }
  }

  @Post('activate-all')
  async activateAllCourts() {
    const allCourts = await this.courtService.findAll();
    const updatedCourts: any[] = [];
    
    for (const court of allCourts) {
      if (!court.IsActive) {
        const updated = await this.courtService.update(court.Id, { IsActive: true });
        updatedCourts.push(updated);
      }
    }
    
    return {
      message: `Activated ${updatedCourts.length} courts`,
      activatedCourts: updatedCourts.map(c => ({ id: c.Id, name: c.Name })),
      totalCourts: allCourts.length
    };
  }
}