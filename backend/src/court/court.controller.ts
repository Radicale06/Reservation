import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { CourtService } from './court.service';

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
  async create(@Body() court: any) {
    return this.courtService.create(court);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() court: any) {
    return this.courtService.update(+id, court);
  }

  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.courtService.toggleActive(+id);
  }
}