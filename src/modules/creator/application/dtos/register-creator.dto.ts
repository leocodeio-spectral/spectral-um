import { IsEmail, IsString, MinLength, IsUrl, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterCreatorDto {
  @ApiProperty({ example: 'John', description: 'The first name of the creator' })
  @IsString()
  @MinLength(2)
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the creator' })
  @IsString()
  @MinLength(2)
  last_name: string;

  @ApiProperty({ example: 'john@example.com', description: 'The email address of the creator' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password for the account' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '+1234567890', description: 'The phone number of the creator' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'https://example.com/profile.jpg', description: 'The profile picture URL' })
  @IsUrl()
  @IsOptional()
  profile_pic_url?: string;
} 