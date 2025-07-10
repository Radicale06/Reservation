import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { CourtService } from './court.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';

@Controller('courts')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Get()
  async findAll() {
    return this.courtService.findAll();
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
}