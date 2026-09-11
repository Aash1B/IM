import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name / title', example: 'Full Synthetic Oil Change' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Detailed procedure description', example: 'Complete synthetic oil replacement with multi-point safety inspection.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Service standard price in INR', example: 1499 })
  @IsNumber()
  @Min(0)
  price!: number;
}
