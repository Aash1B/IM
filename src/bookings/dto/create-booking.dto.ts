import { BookingStatus } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID of the automotive service to book' })
  @IsString()
  serviceId!: string;

  @ApiPropertyOptional({ description: 'Existing customer ID (if linking to an existing customer)' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Customer full name (for new customer)' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer email address' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Customer contact phone number' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Existing vehicle ID (if linking to an existing vehicle)' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiPropertyOptional({ description: 'Vehicle make (e.g. Maruti Suzuki, Tata, Hyundai)' })
  @IsOptional()
  @IsString()
  vehicleMake?: string;

  @ApiPropertyOptional({ description: 'Vehicle model (e.g. Swift, Nexon, Creta)' })
  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @ApiPropertyOptional({ description: 'Vehicle manufacturing year' })
  @IsOptional()
  @IsNumber()
  vehicleYear?: number;

  @ApiPropertyOptional({ description: 'Vehicle license plate / registration number' })
  @IsOptional()
  @IsString()
  vehicleLicensePlate?: string;

  @ApiPropertyOptional({ description: 'Mechanic ID to assign immediately' })
  @IsOptional()
  @IsString()
  mechanicId?: string;

  @ApiPropertyOptional({ description: 'Scheduled appointment date and time' })
  @IsOptional()
  @IsDateString()
  bookingDate?: string;

  @ApiPropertyOptional({ description: 'Amount for the booking (defaults to service standard price)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ enum: BookingStatus, description: 'Initial booking status (defaults to PENDING)' })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
