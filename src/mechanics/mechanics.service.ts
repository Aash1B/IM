import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EventsGateway } from '../events/events.gateway.js';

@Injectable()
export class MechanicsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll() {
    return this.prisma.mechanic.findMany();
  }

  async findAllLocations() {
    // Get the most recent location for each mechanic
    const mechanics = await this.prisma.mechanic.findMany({
      include: {
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });
    return mechanics.map((m) => ({
      mechanicId: m.id,
      name: m.name,
      location: m.locations[0] ?? null,
    }));
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

    // Broadcast via WebSocket
    this.eventsGateway.emitMechanicLocationUpdated(mechanicId, { latitude, longitude });

    return location;
  }
}
