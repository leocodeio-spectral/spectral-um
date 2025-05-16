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
import { ApiKeyGuard, IpRateLimitGuard } from '@leocodeio-njs/njs-auth';
import { LogoutDto } from '../../application/dtos/logout.dto';
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
import {
  CreatorAuthService,
  EditorAuthService,
} from '../../application/services/auth.service';
import {
  EditorLocalAuthGuard,
  CreatorLocalAuthGuard,
} from '../guards/local-auth.guard';
import {
  EditorJwtAuthGuard,
  CreatorJwtAuthGuard,
} from '../guards/jwt-auth.guard';
import { RefreshTokenDto } from 'src/auth/modules/validation/application/dtos/refresh-token.dto';

@UseGuards(IpRateLimitGuard)
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@Controller('creator')
export class CreatorAuthController {
  constructor(private creatorAuthService: CreatorAuthService) {}

  @ApiOperation({ summary: 'User register' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.creatorAuthService.register(registerDto);
  }

  @UseGuards(CreatorLocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @Post('login')
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    return this.creatorAuthService.login(req.user, loginDto);
  }

  @UseGuards(CreatorJwtAuthGuard)
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
    return this.creatorAuthService.getUserProfile(req.user.id);
  }

  @ApiOperation({ summary: 'User Update' })
  @Put('update/:id')
  async update(@Body() updateDto: UpdateDto, @Param('id') id: string) {
    return this.creatorAuthService.update(updateDto, id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    await this.creatorAuthService.logout(logoutDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh your access token' })
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.creatorAuthService.refreshAccessToken(
      refreshTokenDto.refreshToken,
    );
  }

  @ApiOperation({ summary: 'Initiate mobile login' })
  @Post('mobile/login')
  @HttpCode(HttpStatus.OK)
  async initiateMobileLogin(@Body() dto: InitiateMobileLoginDto) {
    return this.creatorAuthService.initiateMobileLogin(dto);
  }

  @ApiOperation({ summary: 'Verify mobile login' })
  @Post('mobile/login/verify')
  @HttpCode(HttpStatus.OK)
  async completeMobileLogin(@Body() dto: CompleteMobileLoginDto) {
    return this.creatorAuthService.completeMobileLogin(dto);
  }

  @ApiOperation({ summary: 'Initiate mobile login' })
  @Post('mail/login')
  @HttpCode(HttpStatus.OK)
  async initiateMailLogin(@Body() dto: InitiateMailLoginDto) {
    return this.creatorAuthService.initiateMailLogin(dto);
  }

  @ApiOperation({ summary: 'Verify mail login' })
  @Post('mail/login/verify')
  @HttpCode(HttpStatus.OK)
  async completeMailLogin(@Body() dto: CompleteMailLoginDto) {
    console.log('hello');
    return this.creatorAuthService.completeMailLogin(dto);
  }

  @ApiOperation({ summary: 'Is user exists' })
  @Post('is-user-exists')
  async isUserExists(@Body() dto: IsUserExistsDto) {
    return this.creatorAuthService.isUserExists(dto.type, dto.identifier);
  }
}

@UseGuards(IpRateLimitGuard)
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
@Controller('editor')
export class EditorAuthController {
  constructor(private editorAuthService: EditorAuthService) {}

  @ApiOperation({ summary: 'User register' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.editorAuthService.register(registerDto);
  }

  @UseGuards(EditorLocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @Post('login')
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    return this.editorAuthService.login(req.user, loginDto);
  }

  @UseGuards(EditorJwtAuthGuard)
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
    return this.editorAuthService.getUserProfile(req.user.id);
  }

  @ApiOperation({ summary: 'User Update' })
  @Put('update/:id')
  async update(@Body() updateDto: UpdateDto, @Param('id') id: string) {
    return this.editorAuthService.update(updateDto, id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    await this.editorAuthService.logout(logoutDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
    };
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh your access token' })
  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.editorAuthService.refreshAccessToken(
      refreshTokenDto.refreshToken,
    );
  }

  @ApiOperation({ summary: 'Initiate mobile login' })
  @Post('mobile/login')
  @HttpCode(HttpStatus.OK)
  async initiateMobileLogin(@Body() dto: InitiateMobileLoginDto) {
    return this.editorAuthService.initiateMobileLogin(dto);
  }

  @ApiOperation({ summary: 'Verify mobile login' })
  @Post('mobile/login/verify')
  @HttpCode(HttpStatus.OK)
  async completeMobileLogin(@Body() dto: CompleteMobileLoginDto) {
    return this.editorAuthService.completeMobileLogin(dto);
  }

  @ApiOperation({ summary: 'Initiate mobile login' })
  @Post('mail/login')
  @HttpCode(HttpStatus.OK)
  async initiateMailLogin(@Body() dto: InitiateMailLoginDto) {
    return this.editorAuthService.initiateMailLogin(dto);
  }

  @ApiOperation({ summary: 'Verify mail login' })
  @Post('mail/login/verify')
  @HttpCode(HttpStatus.OK)
  async completeMailLogin(@Body() dto: CompleteMailLoginDto) {
    return this.editorAuthService.completeMailLogin(dto);
  }

  @ApiOperation({ summary: 'Is user exists' })
  @Post('is-user-exists')
  async isUserExists(@Body() dto: IsUserExistsDto) {
    return this.editorAuthService.isUserExists(dto.type, dto.identifier);
  }
}
