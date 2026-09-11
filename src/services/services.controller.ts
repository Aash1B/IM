import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto.js';

@ApiTags('Services')
@UseGuards(OptionalJwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new automotive service' })
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all available automotive services and pricing' })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific service' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }
}
