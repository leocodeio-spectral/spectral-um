import { ApiProperty } from '@nestjs/swagger';
import { DeviceInfoDto } from './login.dto';
import { IsString, IsIn, IsEmail } from 'class-validator';

export class InitiateMailLoginDto implements DeviceInfoDto {
  @ApiProperty({
    description: 'Email address for login',
    example: 'example@example.com',
    required: true,
  })
  @IsString()
  @IsEmail()
  mail: string;

  @ApiProperty({
    description: 'name for login',
    example: 'Harsha Leo',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Login channel',
    enum: ['web', 'mobile', 'api'],
    example: 'mobile',
    required: true,
  })
  @IsString()
  @IsIn(['web', 'mobile', 'api'])
  channel: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
    required: false,
  })
  @IsString()
  userAgent?: string;
}

export class CompleteMailLoginDto extends InitiateMailLoginDto {
  @ApiProperty({
    description: 'OTP code received via email',
    example: '123456',
    required: true,
  })
  @IsString()
  otp: string;
}
