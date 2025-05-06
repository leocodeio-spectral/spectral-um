import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class VerifyMailDto {
  @ApiProperty({
    description: 'email number to verify',
    example: 'betaleo989@gmail.com',
    required: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'name of the person to verify',
    example: 'Harsha Leo',
    required: true,
  })
  @IsString()
  name: string;
}

export class VerifyMailConfirmDto extends VerifyMailDto {
  @ApiProperty({
    description: 'OTP code received via mail',
    example: '123456',
    required: true,
  })
  @IsString()
  code: string;
}
