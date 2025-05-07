import { ApiProperty } from '@nestjs/swagger';
import { IsMobilePhone, Matches } from 'class-validator';
export class UserProfileDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User mobile number',
    example: '+1234567890',
    required: false,
  })
  @IsMobilePhone()
  @Matches(/^\+/)
  mobile?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'User profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  profilePicUrl: string;

  @ApiProperty({
    description: 'User language',
    example: 'en',
  })
  language: string;

  @ApiProperty({
    description: 'User theme',
    example: 'dark',
  })
  theme: string;

  @ApiProperty({
    description: 'User time zone',
    example: 'America/New_York',
  })
  timeZone: string;

  @ApiProperty({
    description: 'Whether 2FA is enabled for the user',
    example: true,
  })
  twoFactorEnabled: boolean;

  @ApiProperty({
    description: 'List of channels the user is allowed to access',
    example: ['web', 'mobile', 'api'],
  })
  allowedChannels: string[];

  @ApiProperty({
    description: 'User access level',
    example: 'admin',
  })
  accessLevel: string;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-01-26T10:30:00Z',
    required: false,
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;
}
