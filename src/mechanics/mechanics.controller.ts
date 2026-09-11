import { Controller, Get, Param, Body, Post, UseGuards } from '@nestjs/common';
import { MechanicsService } from './mechanics.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('mechanics')
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Post()
  create(@Body() dto: CreateMechanicDto) {
    return this.mechanicsService.create(dto);
  }

  @Get()
  findAll() {
    return this.mechanicsService.findAll();
  }

  @Get('locations')
  findAllLocations() {
    return this.mechanicsService.findAllLocations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Post(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() body: { latitude: number; longitude: number },
  ) {
    return this.mechanicsService.updateLocation(id, body.latitude, body.longitude);
  }
}
