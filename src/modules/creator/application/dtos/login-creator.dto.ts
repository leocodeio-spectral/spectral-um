import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginCreatorDto {
  @ApiProperty({ example: 'john@example.com', description: 'The email address of the creator' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The password for the account' })
  @IsString()
  password: string;
} 