import {
  Controller, Get, Post, Param, Patch, Body, Query,
  UseGuards, Request, Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { BookingsService } from './bookings.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { BookingQueryDto } from './dto/booking-query.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking from the website or operations dashboard' })
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  create(
    @Body() dto: CreateBookingDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.bookingsService.create(dto, userId);
  }

  @Get('export')
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Export bookings to CSV based on filters' })
  async export(@Query() query: BookingQueryDto, @Res() res: Response) {
    const csv = await this.bookingsService.exportToCsv(query);
    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bookings-${timestamp}.csv"`);
    res.send(csv);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a paginated list of bookings with optional filters' })
  findAll(@Query() query: BookingQueryDto) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific booking by ID with history' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update booking status (validates transitions)' })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @Request() req: any,
  ) {
    return this.bookingsService.updateStatus(id, dto, req.user.id);
  }
}
