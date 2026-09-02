import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus, Prisma } from '@prisma/client';
import { BookingQueryDto } from './dto/booking-query.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { isValidTransition } from './booking-transitions.js';
import { EventsGateway } from '../events/events.gateway.js';
import { EmailService } from '../notifications/email.service.js';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private emailService: EmailService,
  ) {}

  async findAll(query: BookingQueryDto) {
    const {
      search,
      status,
      mechanicId,
      serviceId,
      customerId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.BookingWhereInput = {};

    if (status) where.status = status as BookingStatus;
    if (mechanicId) where.mechanicId = mechanicId;
    if (serviceId) where.serviceId = serviceId;
    if (customerId) where.customerId = customerId;

    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = new Date(startDate);
      if (endDate) where.bookingDate.lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }

    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { mechanic: { name: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const allowedSortFields = ['createdAt', 'bookingDate', 'amount', 'status'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.BookingOrderByWithRelationInput = {
      [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          customer: true,
          vehicle: true,
          service: true,
          mechanic: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async exportToCsv(query: BookingQueryDto): Promise<string> {
    const {
      search, status, mechanicId, serviceId, customerId,
      startDate, endDate, minAmount, maxAmount,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = query;

    const where: Prisma.BookingWhereInput = {};
    if (status) where.status = status as BookingStatus;
    if (mechanicId) where.mechanicId = mechanicId;
    if (serviceId) where.serviceId = serviceId;
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) where.bookingDate.gte = new Date(startDate);
      if (endDate) where.bookingDate.lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = parseFloat(minAmount);
      if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }
    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { mechanic: { name: { contains: search, mode: 'insensitive' } } },
        { service: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const allowedSortFields = ['createdAt', 'bookingDate', 'amount', 'status'];
    const orderByField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: Prisma.BookingOrderByWithRelationInput = {
      [orderByField]: sortOrder === 'asc' ? 'asc' : 'desc',
    };

    const bookings = await this.prisma.booking.findMany({
      where,
      orderBy,
      include: {
        customer: true,
        vehicle: true,
        service: true,
        mechanic: true,
      },
    });

    const headers = [
      'ID', 'Booking Date', 'Status', 'Amount',
      'Customer', 'Customer Email',
      'Vehicle Make', 'Vehicle Model', 'Vehicle Year',
      'Service', 'Mechanic', 'Created At',
    ];

    const rows = bookings.map((b) => [
      b.id,
      b.bookingDate.toISOString(),
      b.status,
      b.amount.toFixed(2),
      b.customer?.name ?? '',
      b.customer?.email ?? '',
      b.vehicle?.make ?? '',
      b.vehicle?.model ?? '',
      b.vehicle?.year?.toString() ?? '',
      b.service?.name ?? '',
      b.mechanic?.name ?? '',
      b.createdAt.toISOString(),
    ]);

    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csvLines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];

    return csvLines.join('\n');
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        service: true,
        mechanic: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
    changedByUserId: string,
  ) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const newStatus = dto.status as BookingStatus;

    if (!Object.values(BookingStatus).includes(newStatus)) {
      throw new BadRequestException(`Invalid status: ${dto.status}`);
    }

    if (!isValidTransition(booking.status, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${booking.status} to ${newStatus}`,
      );
    }

    // ASSIGNED requires a mechanic
    if (newStatus === BookingStatus.ASSIGNED && !dto.mechanicId && !booking.mechanicId) {
      throw new BadRequestException('A mechanicId is required when assigning a booking');
    }

    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
        where: { id },
        data: {
          status: newStatus,
          ...(dto.mechanicId && { mechanicId: dto.mechanicId }),
        },
        include: {
          customer: true,
          vehicle: true,
          service: true,
          mechanic: true,
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: newStatus,
          changedBy: changedByUserId,
        },
      });

      // Find any user to send notification to (in production this would target specific users)
      const adminUser = await tx.user.findFirst();
      if (adminUser) {
        await tx.notification.create({
          data: {
            userId: adminUser.id,
            message: `Booking ${id} status changed from ${booking.status} to ${newStatus}`,
          },
        });
      }

      return result;
    });

    // Emit WebSocket events AFTER the transaction is committed
    this.eventsGateway.emitBookingUpdated(id, {
      status: newStatus,
      booking: updatedBooking,
    });
    this.eventsGateway.emitNotification({
      message: `Booking status updated to ${newStatus}`,
      bookingId: id,
    });

    // Send email notification to customer
    if (updatedBooking.customer?.email) {
      this.emailService.sendEmail(
        updatedBooking.customer.email,
        `Booking Update: ${newStatus}`,
        `Hello ${updatedBooking.customer.name},\n\nYour booking for ${updatedBooking.service?.name} is now ${newStatus}.`,
        `<p>Hello ${updatedBooking.customer.name},</p><p>Your booking for <b>${updatedBooking.service?.name}</b> is now <b>${newStatus}</b>.</p>`
      );
    }

    return updatedBooking;
  }
}
