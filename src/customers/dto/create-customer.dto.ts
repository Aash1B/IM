import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ description: 'Customer full name', example: 'Pooja Sharma' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Customer email address', example: 'pooja.sharma@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Customer phone number', example: '+91 9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Vehicle make', example: 'Hyundai' })
  @IsOptional()
  @IsString()
  vehicleMake?: string;

  @ApiPropertyOptional({ description: 'Vehicle model', example: 'Creta' })
  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @ApiPropertyOptional({ description: 'Vehicle year', example: 2023 })
  @IsOptional()
  @IsNumber()
  vehicleYear?: number;

  @ApiPropertyOptional({ description: 'Vehicle license plate', example: 'DL-01-AB-1234' })
  @IsOptional()
  @IsString()
  vehicleLicensePlate?: string;
}
