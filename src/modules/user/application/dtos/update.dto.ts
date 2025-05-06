import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsIn,
  MinLength,
  Matches,
  IsOptional,
  IsMobilePhone,
  IsUrl,
} from 'class-validator';

export class UpdateDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User mobile number',
    example: '12543008333',
    required: false,
  })
  @IsMobilePhone()
  @Matches(/^\+/)
  @IsString()
  @IsOptional()
  mobile?: string;

  @ApiProperty({
    description:
      'User password - must be at least 12 characters and contain uppercase, lowercase, number, special character',
    example: 'SecurePass123!',
    required: true,
    minLength: 12,
  })
  @IsString()
  @MinLength(12)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    {
      message:
        'Password must contain uppercase, lowercase, number, special character',
    },
  )
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'Registration channel',
    enum: ['web', 'mobile', 'api'],
    example: 'web',
    required: false,
  })
  @IsString()
  @IsIn(['web', 'mobile', 'api'])
  @IsOptional()
  channel?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: true,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'User profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  // @IsUrl()
  @IsString()
  @IsOptional()
  profilePicUrl?: string;

  @ApiProperty({
    description: 'User language',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'User theme',
    example: 'dark',
    required: false,
  })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiProperty({
    description: 'User time zone',
    example: 'UTC',
    required: false,
  })
  @IsString()
  @IsOptional()
  timeZone?: string;

  @ApiProperty({
    description: 'User status',
    example: 'active',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
