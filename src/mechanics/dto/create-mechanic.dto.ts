import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMechanicDto {
  @ApiProperty({ description: 'Full name of the mechanic', example: 'Rajesh Kumar' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Email address of the mechanic', example: 'rajesh.kumar@instantmechanic.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Phone number of the mechanic', example: '+91 9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Initial latitude', example: 28.5355 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Initial longitude', example: 77.3910 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
