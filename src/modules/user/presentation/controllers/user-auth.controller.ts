import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
  Param,
  Get,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { Request } from 'express';
import { LoginDto } from '../../application/dtos/login.dto';
import { IpRateLimitGuard } from '@leocodeio-njs/njs-auth';
import { RefreshTokenDto } from '../../../core/validation/application/dtos/refresh-token.dto';
import { LogoutDto } from '../../application/dtos/logout.dto';
import { AuthService } from 'src/modules/user/application/services/auth.service';
import { LocalAuthGuard } from 'src/utils/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { RegisterDto } from '../../application/dtos/register.dto';
import { UpdateDto } from '../../application/dtos/update.dto';
import { UserProfileDto } from '../../application/dtos/user-profile.dto';
import {
  CompleteMobileLoginDto,
  InitiateMobileLoginDto,
} from '../../application/dtos/mobile-login.dto';
import { IsUserExistsDto } from '../../application/dtos/is-user-exists.dto';
import {
  CompleteMailLoginDto,
  InitiateMailLoginDto,
} from '../../application/dtos/mail-login.dto';

@UseGuards(IpRateLimitGuard)
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@Controller('user')
export class UserAuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User register' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @Post('login')
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user, loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch user profile' })
  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
  })
  async getProfile(@Req() req: Request): Promise<UserProfileDto> {
    return this.authService.getUserProfile(req.user.id);
  }

  @ApiOperation({ summary: 'User Update' })
  @Put('update/:id')
  async update(@Body() updateDto: UpdateDto, @Param('id') id: string) {
    return this.authService.update(updateDto, id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh your access token' })
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @ApiOperation({ summary: 'Initiate mobile login' })
  @Post('mobile/login')
  @HttpCode(HttpStatus.OK)
  async initiateMobileLogin(@Body() dto: InitiateMobileLoginDto) {
    return this.authService.initiateMobileLogin(dto);
  }

  @ApiOperation({ summary: 'Verify mobile login' })
  @Post('mobile/login/verify')
  @HttpCode(HttpStatus.OK)
  async completeMobileLogin(@Body() dto: CompleteMobileLoginDto) {
    return this.authService.completeMobileLogin(dto);
  }

  @ApiOperation({ summary: 'Initiate mobile login' })
  @Post('mail/login')
  @HttpCode(HttpStatus.OK)
  async initiateMailLogin(@Body() dto: InitiateMailLoginDto) {
    return this.authService.initiateMailLogin(dto);
  }

  @ApiOperation({ summary: 'Verify mail login' })
  @Post('mail/login/verify')
  @HttpCode(HttpStatus.OK)
  async completeMailLogin(@Body() dto: CompleteMailLoginDto) {
    return this.authService.completeMailLogin(dto);
  }

  @ApiOperation({ summary: 'Is user exists' })
  @Post('is-user-exists')
  async isUserExists(@Body() dto: IsUserExistsDto) {
    return this.authService.isUserExists(dto.type, dto.identifier);
  }
}
