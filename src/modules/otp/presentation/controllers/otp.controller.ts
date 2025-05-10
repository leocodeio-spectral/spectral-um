import { IpRateLimitGuard } from '@leocodeio-njs/njs-auth';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import {
  VerifyMobileConfirmDto,
  VerifyMobileDto,
} from 'src/modules/validation/application/dtos/verify-mobile.dto';
import { EmailjsMailerService } from '../../application/services/emailjs-mailer.service';
import {
  VerifyMailConfirmDto,
  VerifyMailDto,
} from 'src/modules/validation/application/dtos/verify-mail.dto';
import { OtpService } from '../../application/services/otp.service';
import { ConfigService } from '@nestjs/config';
import {
  CreatorAuthService,
  EditorAuthService,
} from 'src/modules/user/application/services/auth.service';

@UseGuards(IpRateLimitGuard)
@ApiSecurity('x-api-key')
@Controller('creator/otp')
export class CreatorOtpController {
  constructor(
    private authService: CreatorAuthService,
    private emailjsMailerService: EmailjsMailerService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) {}

  @Post('verify-mobile')
  @ApiOperation({ summary: 'Request mobile OTP' })
  @HttpCode(HttpStatus.OK)
  async requestVerification(@Body() dto: VerifyMobileDto) {
    await this.authService.requestMobileOTP(dto.mobile);
    return {
      statusCode: HttpStatus.OK,
      message: 'Verification code sent',
    };
  }

  @Post('verify-mobile/confirm')
  @ApiOperation({ summary: 'Confirm mobile OTP' })
  @HttpCode(HttpStatus.OK)
  async confirmVerification(@Body() dto: VerifyMobileConfirmDto) {
    const isValid = await this.authService.verifyOTP(dto.mobile, dto.code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Mobile number verified successfully',
    };
  }

  @Post('verify-mail')
  @ApiOperation({ summary: 'Request email OTP' })
  @HttpCode(HttpStatus.OK)
  async requestMailVerification(@Body() dto: VerifyMailDto) {
    // Generate OTP using the new service
    const otp = this.otpService.generateToken(
      dto.email,
      this.configService.get('TOPT_SECRET') || 'default-salt',
    );

    // Send the OTP via email
    await this.emailjsMailerService.sendOtpMail(dto.email, dto.name, otp);

    return {
      statusCode: HttpStatus.OK,
      message: 'Verification code sent',
    };
  }

  @Post('verify-mail/confirm')
  @ApiOperation({ summary: 'Confirm email OTP' })
  @HttpCode(HttpStatus.OK)
  async confirmMailVerification(@Body() dto: VerifyMailConfirmDto) {
    // Verify OTP using the new service
    const isValid = await this.emailjsMailerService.verifyOtpMail(
      dto.email,
      dto.code,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Email verified successfully',
    };
  }
}

@UseGuards(IpRateLimitGuard)
@ApiSecurity('x-api-key')
@Controller('editor/otp')
export class EditorOtpController {
  constructor(
    private authService: EditorAuthService,
    private emailjsMailerService: EmailjsMailerService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) {}

  @Post('verify-mobile')
  @ApiOperation({ summary: 'Request mobile OTP' })
  @HttpCode(HttpStatus.OK)
  async requestVerification(@Body() dto: VerifyMobileDto) {
    await this.authService.requestMobileOTP(dto.mobile);
    return {
      statusCode: HttpStatus.OK,
      message: 'Verification code sent',
    };
  }

  @Post('verify-mobile/confirm')
  @ApiOperation({ summary: 'Confirm mobile OTP' })
  @HttpCode(HttpStatus.OK)
  async confirmVerification(@Body() dto: VerifyMobileConfirmDto) {
    const isValid = await this.authService.verifyOTP(dto.mobile, dto.code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Mobile number verified successfully',
    };
  }

  @Post('verify-mail')
  @ApiOperation({ summary: 'Request email OTP' })
  @HttpCode(HttpStatus.OK)
  async requestMailVerification(@Body() dto: VerifyMailDto) {
    // Generate OTP using the new service
    const otp = this.otpService.generateToken(
      dto.email,
      this.configService.get('TOPT_SECRET') || 'default-salt',
    );

    // Send the OTP via email
    await this.emailjsMailerService.sendOtpMail(dto.email, dto.name, otp);

    return {
      statusCode: HttpStatus.OK,
      message: 'Verification code sent',
    };
  }

  @Post('verify-mail/confirm')
  @ApiOperation({ summary: 'Confirm email OTP' })
  @HttpCode(HttpStatus.OK)
  async confirmMailVerification(@Body() dto: VerifyMailConfirmDto) {
    // Verify OTP using the new service
    const isValid = await this.emailjsMailerService.verifyOtpMail(
      dto.email,
      dto.code,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Email verified successfully',
    };
  }
}
