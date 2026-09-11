import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventsGateway } from '../events/events.gateway.js';
import { CreateMechanicDto } from './dto/create-mechanic.dto.js';

@Injectable()
export class MechanicsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  private mechanicsCache: { data: any; expiry: number } | null = null;
  private locationsCache: { data: any; expiry: number } | null = null;

  async findAll() {
    if (this.mechanicsCache && Date.now() < this.mechanicsCache.expiry) {
      return this.mechanicsCache.data;
    }
    const data = await this.prisma.mechanic.findMany({
      orderBy: { createdAt: 'desc' },
    });
    this.mechanicsCache = { data, expiry: Date.now() + 30000 };
    return data;
  }

  async findAllLocations() {
    if (this.locationsCache && Date.now() < this.locationsCache.expiry) {
      return this.locationsCache.data;
    }
    // Get the most recent location for each mechanic
    const mechanics = await this.prisma.mechanic.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    const result = mechanics.map((m) => ({
      mechanicId: m.id,
      name: m.name,
      location: m.locations[0] ?? null,
    }));
    this.locationsCache = { data: result, expiry: Date.now() + 15000 };
    return result;
  }

  async findOne(id: string) {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id },
      include: {
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    if (!mechanic) throw new NotFoundException('Mechanic not found');
    return mechanic;
  }

  async updateLocation(mechanicId: string, latitude: number, longitude: number) {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id: mechanicId } });
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    const location = await this.prisma.mechanicLocation.create({
      data: { mechanicId, latitude, longitude },
    });

    this.locationsCache = null;

    // Broadcast via WebSocket
    this.eventsGateway.emitMechanicLocationUpdated(mechanicId, { latitude, longitude });

    return location;
  }

  async create(dto: CreateMechanicDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.mechanic.findUnique({
      where: { email },
    });
    if (existing) {
      throw new BadRequestException('A mechanic with this email already exists');
    }

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (existingCustomer) {
      throw new BadRequestException('A customer with this email address already exists. Mechanics cannot share customer emails.');
    }

    const mechanic = await this.prisma.mechanic.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        phone: dto.phone?.trim() || null,
        ...(dto.latitude !== undefined && dto.longitude !== undefined
          ? {
              locations: {
                create: {
                  latitude: dto.latitude,
                  longitude: dto.longitude,
                },
              },
            }
          : {}),
      },
      include: {
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    this.mechanicsCache = null;
    this.locationsCache = null;

    return mechanic;
  }
}
