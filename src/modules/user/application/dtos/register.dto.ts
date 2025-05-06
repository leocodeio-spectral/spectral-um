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

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'harsha@gmail.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User mobile number',
    example: '+919603028848',
    required: true,
  })
  @IsString()
  @IsMobilePhone()
  @Matches(/^\+/)
  mobile: string;

  @ApiProperty({
    description:
      'User password - must be at least 12 characters and contain uppercase, lowercase, number, special character',
    example: 'basic@9897N',
    required: true,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
    {
      message:
        'Password must contain uppercase, lowercase, number, special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Registration channel',
    enum: ['web', 'mobile', 'api'],
    example: 'web',
    required: true,
  })
  @IsString()
  @IsIn(['web', 'mobile', 'api'])
  channel: string;

  @ApiProperty({
    description: 'Mobile verification code',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  mobileVerificationCode?: string;

  @ApiProperty({
    description: 'Mobile verification code',
    example: '123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  mailVerificationCode?: string;

  @ApiProperty({
    description: 'User First name',
    example: 'Harsha',
    required: true,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User Last name',
    example: 'Leo',
    required: true,
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User Profile Picture URL',
    example: 'https://github.com/shadcn.png',
    required: false,
  })
  // @IsUrl()
  @IsString()
  @IsOptional()
  profilePicUrl?: string;

  @ApiProperty({
    description: 'User Language',
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
}
