import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const email = dto.email.toLowerCase().trim();
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (existingCustomer) {
      throw new BadRequestException('A customer with this email already exists');
    }

    const existingMechanic = await this.prisma.mechanic.findUnique({
      where: { email },
    });
    if (existingMechanic) {
      throw new BadRequestException('A mechanic with this email address already exists. Mechanics cannot be added as customers.');
    }

    return this.prisma.customer.create({
      data: {
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        ...(dto.vehicleMake && dto.vehicleModel
          ? {
              vehicles: {
                create: {
                  make: dto.vehicleMake.trim(),
                  model: dto.vehicleModel.trim(),
                  year: dto.vehicleYear || new Date().getFullYear(),
                  licensePlate: dto.vehicleLicensePlate?.trim().toUpperCase() || null,
                },
              },
            }
          : {}),
      },
      include: {
        vehicles: true,
      },
    });
  }

  async findAll() {
    const mechanics = await this.prisma.mechanic.findMany({
      select: { email: true },
    });
    const mechanicEmails = mechanics.map((m) => m.email.toLowerCase().trim());

    return this.prisma.customer.findMany({
      where: mechanicEmails.length > 0 ? {
        email: { notIn: mechanicEmails },
      } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        vehicles: true,
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        bookings: true,
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
