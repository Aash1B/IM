import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus, Prisma } from '@prisma/client';
import { BookingQueryDto } from './dto/booking-query.dto.js';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
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

  async create(dto: CreateBookingDto, changedByUserId?: string) {
    // 1. Validate service
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${dto.serviceId} not found`);
    }

    // 2. Resolve Customer
    let customer: any = null;
    if (dto.customerId) {
      customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${dto.customerId} not found`);
      }
    } else if (dto.customerEmail) {
      const email = dto.customerEmail.toLowerCase().trim();
      customer = await this.prisma.customer.findUnique({
        where: { email },
      });
      if (!customer) {
        customer = await this.prisma.customer.create({
          data: {
            name: dto.customerName || 'Car Owner',
            email,
            phone: dto.customerPhone || null,
          },
        });
      }
    } else {
      throw new BadRequestException(
        'Customer identifier required: provide either customerId or customerEmail',
      );
    }

    // 3. Resolve Vehicle
    let vehicle: any = null;
    if (dto.vehicleId) {
      vehicle = await this.prisma.vehicle.findUnique({
        where: { id: dto.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(`Vehicle with ID ${dto.vehicleId} not found`);
      }
    } else {
      vehicle = await this.prisma.vehicle.create({
        data: {
          make: dto.vehicleMake || 'Automobile',
          model: dto.vehicleModel || 'Standard',
          year: dto.vehicleYear || new Date().getFullYear(),
          licensePlate: dto.vehicleLicensePlate || null,
          customerId: customer.id,
        },
      });
    }

    // 4. Validate mechanic if provided
    if (dto.mechanicId) {
      const mechanic = await this.prisma.mechanic.findUnique({
        where: { id: dto.mechanicId },
      });
      if (!mechanic) {
        throw new NotFoundException(`Mechanic with ID ${dto.mechanicId} not found`);
      }
    }

    const bookingStatus: BookingStatus =
      dto.status || (dto.mechanicId ? BookingStatus.ASSIGNED : BookingStatus.PENDING);
    const bookingAmount = dto.amount !== undefined ? dto.amount : service.price;
    const bookingDate = dto.bookingDate ? new Date(dto.bookingDate) : new Date();

    // 5. Execute transactional creation
    const createdBooking = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          customerId: customer.id,
          vehicleId: vehicle.id,
          serviceId: service.id,
          mechanicId: dto.mechanicId || null,
          status: bookingStatus,
          amount: bookingAmount,
          bookingDate,
        },
        include: {
          customer: true,
          vehicle: true,
          service: true,
          mechanic: true,
        },
      });

      // Initial status history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: null,
          toStatus: bookingStatus,
          changedBy: changedByUserId || 'WEBSITE_BOOKING',
        },
      });

      // Notify operations / admins
      const adminUser = await tx.user.findFirst();
      if (adminUser) {
        await tx.notification.create({
          data: {
            userId: adminUser.id,
            message: `New booking #${booking.id.substring(0, 8).toUpperCase()} received: ${customer.name} - ${service.name}`,
          },
        });
      }

      return booking;
    });

    // 6. Broadcast Real-time WebSocket events
    this.eventsGateway.emitBookingUpdated(createdBooking.id, {
      status: bookingStatus,
      booking: createdBooking,
    });
    this.eventsGateway.emitNotification({
      message: `New booking created: #${createdBooking.id.substring(0, 8).toUpperCase()} for ${customer.name}`,
      bookingId: createdBooking.id,
    });

    // 7. Send confirmation email
    if (customer.email) {
      const formattedDate = bookingDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      this.emailService.sendEmail(
        customer.email,
        `Booking Confirmation: ${service.name} [#${createdBooking.id.substring(0, 8).toUpperCase()}]`,
        `Hello ${customer.name},\n\nYour service booking for ${service.name} has been received!\nDate: ${formattedDate}\nVehicle: ${vehicle.make} ${vehicle.model}\nAmount: ₹${bookingAmount}\nStatus: ${bookingStatus}\n\nInstant Mechanic Team`,
        `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #F98513; margin-top: 0;">Instant Mechanic - Booking Confirmed</h2>
          <p>Dear <strong>${customer.name}</strong>,</p>
          <p>We have successfully scheduled your automotive service appointment:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Booking Ref:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">#${createdBooking.id.substring(0, 8).toUpperCase()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Service:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${service.name}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Vehicle:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${vehicle.make} ${vehicle.model} (${vehicle.licensePlate || 'N/A'})</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Scheduled Date:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${formattedDate}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">Total Price:</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #16a34a; font-weight: bold;">₹${bookingAmount.toLocaleString('en-IN')}</td>
            </tr>
          </table>
          <p style="color: #6b7280; font-size: 13px;">Our certified mechanic will assist you as scheduled. If you have questions, reply to this email.</p>
        </div>`,
      );
    }

    return createdBooking;
  }
}

