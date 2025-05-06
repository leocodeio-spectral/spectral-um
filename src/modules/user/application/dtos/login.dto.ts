import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export interface DeviceInfoDto {
  channel: string;
  userAgent?: string;
}

export class LoginDto implements DeviceInfoDto {
  @ApiProperty({
    description: 'User identifier (email or mobile)',
    example: 'harsha@gmail.com or +919603028848',
    required: true,
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'User password',
    example: 'basic@9897N',
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Login channel',
    enum: ['web', 'mobile', 'api'],
    example: 'web',
    required: true,
  })
  @IsString()
  @IsIn(['web', 'mobile', 'api'])
  channel: string;

  @ApiProperty({
    description: '2FA code if enabled',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  twoFactorCode?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0...',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
