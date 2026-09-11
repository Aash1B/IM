import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';

@Injectable()
export class ServicesService {
  private cache: { data: any; expiry: number } | null = null;

  constructor(private prisma: PrismaService) {}

  async findAll() {
    if (this.cache && Date.now() < this.cache.expiry) {
      return this.cache.data;
    }
    const data = await this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    this.cache = { data, expiry: Date.now() + 60000 };
    return data;
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async create(dto: CreateServiceDto) {
    const service = await this.prisma.service.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        price: Number(dto.price),
      },
    });
    this.cache = null; // Invalidate cache
    return service;
  }
}
