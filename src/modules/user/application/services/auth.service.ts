import {
  Injectable,
  Inject,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Import specialized services

import {
  CorrelationService,
  DebugUtil,
  LoggerService,
} from '@leocodeio-njs/njs-logging';
import {
  ICreatorPreferencesPort,
  IEditorPreferencesPort,
} from '../../domain/ports/user-preferences.port';
import {
  CreatorAuthenticationService,
  EditorAuthenticationService,
} from './user-authentication.service';
import { SessionManagementService } from 'src/modules/session/application/services/session-management.service';
import {
  EditorTwoFactorAuthService,
  CreatorTwoFactorAuthService,
} from './two-factor-auth.service';
import { MobileVerificationService } from 'src/modules/otp/application/services/mobile-verification.service';
import {
  CreatorRegistrationService,
  EditorRegistrationService,
} from './user-registration.service';
import { OtpService } from 'src/modules/otp/application/services/otp.service';
import { EmailjsMailerService } from 'src/modules/otp/application/services/emailjs-mailer.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterDto } from '../dtos/register.dto';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { UpdateDto } from '../dtos/update.dto';
import { LogoutDto } from '../dtos/logout.dto';
import { ICreatorPort, IEditorPort } from '../../domain/ports/user.port';
import {
  CreatorTokenManagementService,
  EditorTokenManagementService,
} from 'src/modules/session/application/services/token-management.service';
import {
  CompleteMobileLoginDto,
  InitiateMobileLoginDto,
} from '../dtos/mobile-login.dto';
import {
  CompleteMailLoginDto,
  InitiateMailLoginDto,
} from '../dtos/mail-login.dto';

@Injectable()
export class CreatorAuthService {
  constructor(
    private readonly userPort: ICreatorPort,
    private readonly userPreferencesRepository: ICreatorPreferencesPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly correlationService: CorrelationService,

    // Inject specialized services
    private readonly userAuthService: CreatorAuthenticationService,
    private readonly tokenService: CreatorTokenManagementService,
    private readonly sessionService: SessionManagementService,
    private readonly twoFactorService: CreatorTwoFactorAuthService,
    private readonly mobileVerificationService: MobileVerificationService,
    private readonly userRegistrationService: CreatorRegistrationService,

    // mail otp
    private readonly otpService: OtpService,
    private readonly emailjsMailerService: EmailjsMailerService,
  ) {
    this.logger.setLogContext('AuthService');
  }

  // User validation (for passport strategy)
  async validateUser(identifier: string, password: string): Promise<any> {
    this.logger.debug('Validating user credentials', {
      identifier,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.userAuthService.validateUser(identifier, password);
  }

  // Login
  async login(user: any, loginDto: LoginDto) {
    this.logger.debug('Processing login request', {
      userId: user.id,
      channel: loginDto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });
    console.log(1);
    return this.userAuthService.login(user, loginDto);
  }

  // create new user
  async register(dto: RegisterDto): Promise<UserProfileDto> {
    console.log(2);
    return this.userRegistrationService.register(dto);
  }

  // Update user
  async update(dto: UpdateDto, id: string): Promise<UserProfileDto> {
    this.logger.debug('Processing user update request', {
      userId: id,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.userRegistrationService.update(dto, id);
  }

  // Logout
  async logout(logoutDto: LogoutDto): Promise<void> {
    this.logger.debug('Processing logout request', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.userAuthService.logout(logoutDto);
  }

  // Refresh token
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    sessionId: string;
  }> {
    this.logger.debug('Processing token refresh request', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.tokenService.refreshAccessToken(refreshToken);
  }

  // Two-factor authentication setup
  async setup2FA(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    this.logger.debug('Setting up 2FA for user', {
      userId,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.twoFactorService.setup2FA(userId);
  }

  // Token validation
  async validateToken(
    userId: string,
    channel: string,
    clientId?: string,
    baseUrl?: string,
    baseMethod?: string,
  ): Promise<boolean> {
    this.logger.debug('Validating token authorization', {
      userId,
      channel,
      clientId,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.tokenService.validateToken(
      userId,
      channel,
      clientId,
      baseUrl,
      baseMethod,
    );
  }

  // Mobile verification
  async requestMobileOTP(mobile: string): Promise<string> {
    this.logger.debug('Requesting mobile OTP', {
      mobile,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.mobileVerificationService.requestMobileOTP(mobile);
  }

  // OTP verification
  async verifyOTP(mobile: string, code: string): Promise<boolean> {
    this.logger.debug('Verifying OTP', {
      mobile,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.mobileVerificationService.verifyOTP(mobile, code);
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    this.logger.debug('Retrieving user profile', {
      userId,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const user = await this.userPort.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);
    if (!userPreferences) {
      throw new UnauthorizedException('User preferences not found');
    }

    return {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicUrl: user.profilePicUrl || '',
      language: userPreferences.language,
      theme: userPreferences.theme,
      timeZone: userPreferences.timeZone,
      twoFactorEnabled: user.twoFactorEnabled,
      allowedChannels: user.allowedChannels,
      accessLevel: user.accessLevel,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  // Get user's active sessions
  async getUserSessions(accessToken: string) {
    this.logger.debug('Retrieving user sessions', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    try {
      const decoded = this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.sessionService.getUserSessions(decoded.sub);
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw error;
    }
  }

  // Mobile login initialization
  async initiateMobileLogin(
    dto: InitiateMobileLoginDto,
  ): Promise<{ reference: string }> {
    this.logger.debug('Initiating mobile login', {
      mobile: dto.mobile,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Check if user exists first
    const user = await this.userPort.findByIdentifier(dto.mobile);
    if (!user) {
      throw new UnauthorizedException(
        'Please register before attempting to login. Registration requires both email and mobile number.',
      );
    }

    // Generate and send OTP through the mobile verification service
    const reference = await this.mobileVerificationService.requestMobileOTP(
      dto.mobile,
    );
    return { reference };
  }

  // Complete mobile login
  async completeMobileLogin(dto: CompleteMobileLoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    sessionId: string;
  }> {
    this.logger.debug('Completing mobile login', {
      mobile: dto.mobile,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Verify user exists with complete profile
    const user = await this.userPort.findByIdentifier(dto.mobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.email || !user.mobile) {
      throw new UnauthorizedException(
        'Incomplete registration. Please complete registration with both email and mobile number.',
      );
    }

    // Verify OTP
    const isValid = await this.mobileVerificationService.verifyOTP(
      dto.mobile,
      dto.otp,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Create session and tokens
    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user, sessionId, dto.channel),
      this.tokenService.generateRefreshToken(user.id, sessionId, tokenFamily),
    ]);

    // Create session
    await this.sessionService.createSession({
      id: sessionId,
      userId: user.id,
      deviceInfo: `${dto.channel}${dto.userAgent ? ` - ${dto.userAgent}` : ''}`,
      channel: dto.channel,
      refreshTokenFamily: tokenFamily,
      userAgent: dto.userAgent,
      metadata: {
        loginMethod: 'mobile_otp',
      },
    });

    // Update user's last login
    await this.userPort.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      sessionId,
    };
  }

  // mail login initialization
  async initiateMailLogin(
    dto: InitiateMailLoginDto,
  ): Promise<{ reference: string }> {
    this.logger.debug('Initiating mail login', {
      mail: dto.mail,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Check if user exists first
    const user = await this.userPort.findByIdentifier(dto.mail);
    if (!user) {
      throw new UnauthorizedException(
        'Please register before attempting to login. Registration requires both email and mobile number.',
      );
    }
    // Generate OTP using the new service
    const otp = this.otpService.generateToken(
      dto.mail,
      this.configService.get('TOPT_SECRET') || 'default-salt',
    );

    // Send the OTP via email
    await this.emailjsMailerService.sendOtpMail(dto.mail, dto.name, otp);
    return { reference: 'email is sent' };
  }
  // complete mail login
  async completeMailLogin(dto: CompleteMailLoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    sessionId: string;
  }> {
    this.logger.debug('Completing mail login', {
      mail: dto.mail,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Verify user exists with complete profile
    const user = await this.userPort.findByIdentifier(dto.mail);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.email || !user.mobile) {
      throw new UnauthorizedException(
        'Incomplete registration. Please complete registration with both email and mobile number.',
      );
    }

    // Verify OTP using the new service
    const isValid = this.otpService.verifyToken(
      dto.mail,
      this.configService.get('TOPT_SECRET') || 'default-salt',
      dto.otp,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Create session and tokens
    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user, sessionId, dto.channel),
      this.tokenService.generateRefreshToken(user.id, sessionId, tokenFamily),
    ]);

    // Create session
    await this.sessionService.createSession({
      id: sessionId,
      userId: user.id,
      deviceInfo: `${dto.channel}${dto.userAgent ? ` - ${dto.userAgent}` : ''}`,
      channel: dto.channel,
      refreshTokenFamily: tokenFamily,
      userAgent: dto.userAgent,
      metadata: {
        loginMethod: 'mobile_otp',
      },
    });

    // Update user's last login
    await this.userPort.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      sessionId,
    };
  }

  // Check if user exists
  async isUserExists(
    type: 'email' | 'mobile',
    identifier: string,
  ): Promise<boolean> {
    this.logger.debug('Checking if user exists', {
      type,
      identifier,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const user = await this.userPort.findByIdentifier(identifier);
    return !!user;
  }
}

@Injectable()
export class EditorAuthService {
  constructor(
    private readonly userPort: IEditorPort,
    private readonly userPreferencesRepository: IEditorPreferencesPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly correlationService: CorrelationService,

    // Inject specialized services
    private readonly userAuthService: EditorAuthenticationService,
    private readonly tokenService: EditorTokenManagementService,
    private readonly sessionService: SessionManagementService,
    private readonly twoFactorService: EditorTwoFactorAuthService,
    private readonly mobileVerificationService: MobileVerificationService,
    private readonly userRegistrationService: EditorRegistrationService,

    // mail otp
    private readonly otpService: OtpService,
    private readonly emailjsMailerService: EmailjsMailerService,
  ) {
    this.logger.setLogContext('AuthService');
  }

  // User validation (for passport strategy)
  async validateUser(identifier: string, password: string): Promise<any> {
    this.logger.debug('Validating user credentials', {
      identifier,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.userAuthService.validateUser(identifier, password);
  }

  // Login
  async login(user: any, loginDto: LoginDto) {
    this.logger.debug('Processing login request', {
      userId: user.id,
      channel: loginDto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.userAuthService.login(user, loginDto);
  }

  // create new user
  async register(dto: RegisterDto): Promise<UserProfileDto> {
    return this.userRegistrationService.register(dto);
  }

  // Update user
  async update(dto: UpdateDto, id: string): Promise<UserProfileDto> {
    this.logger.debug('Processing user update request', {
      userId: id,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.userRegistrationService.update(dto, id);
  }

  // Logout
  async logout(logoutDto: LogoutDto): Promise<void> {
    this.logger.debug('Processing logout request', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.userAuthService.logout(logoutDto);
  }

  // Refresh token
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    sessionId: string;
  }> {
    this.logger.debug('Processing token refresh request', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.tokenService.refreshAccessToken(refreshToken);
  }

  // Two-factor authentication setup
  async setup2FA(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    this.logger.debug('Setting up 2FA for user', {
      userId,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.twoFactorService.setup2FA(userId);
  }

  // Token validation
  async validateToken(
    userId: string,
    channel: string,
    clientId?: string,
    baseUrl?: string,
    baseMethod?: string,
  ): Promise<boolean> {
    this.logger.debug('Validating token authorization', {
      userId,
      channel,
      clientId,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.tokenService.validateToken(
      userId,
      channel,
      clientId,
      baseUrl,
      baseMethod,
    );
  }

  // Mobile verification
  async requestMobileOTP(mobile: string): Promise<string> {
    this.logger.debug('Requesting mobile OTP', {
      mobile,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.mobileVerificationService.requestMobileOTP(mobile);
  }

  // OTP verification
  async verifyOTP(mobile: string, code: string): Promise<boolean> {
    this.logger.debug('Verifying OTP', {
      mobile,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return this.mobileVerificationService.verifyOTP(mobile, code);
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfileDto> {
    this.logger.debug('Retrieving user profile', {
      userId,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const user = await this.userPort.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);
    if (!userPreferences) {
      throw new UnauthorizedException('User preferences not found');
    }

    return {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicUrl: user.profilePicUrl || '',
      language: userPreferences.language,
      theme: userPreferences.theme,
      timeZone: userPreferences.timeZone,
      twoFactorEnabled: user.twoFactorEnabled,
      allowedChannels: user.allowedChannels,
      accessLevel: user.accessLevel,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  // Get user's active sessions
  async getUserSessions(accessToken: string) {
    this.logger.debug('Retrieving user sessions', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    try {
      const decoded = this.jwtService.verify(accessToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.sessionService.getUserSessions(decoded.sub);
    } catch (error) {
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw error;
    }
  }

  // Mobile login initialization
  async initiateMobileLogin(
    dto: InitiateMobileLoginDto,
  ): Promise<{ reference: string }> {
    this.logger.debug('Initiating mobile login', {
      mobile: dto.mobile,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Check if user exists first
    const user = await this.userPort.findByIdentifier(dto.mobile);
    if (!user) {
      throw new UnauthorizedException(
        'Please register before attempting to login. Registration requires both email and mobile number.',
      );
    }

    // Generate and send OTP through the mobile verification service
    const reference = await this.mobileVerificationService.requestMobileOTP(
      dto.mobile,
    );
    return { reference };
  }

  // Complete mobile login
  async completeMobileLogin(dto: CompleteMobileLoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    sessionId: string;
  }> {
    this.logger.debug('Completing mobile login', {
      mobile: dto.mobile,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Verify user exists with complete profile
    const user = await this.userPort.findByIdentifier(dto.mobile);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.email || !user.mobile) {
      throw new UnauthorizedException(
        'Incomplete registration. Please complete registration with both email and mobile number.',
      );
    }

    // Verify OTP
    const isValid = await this.mobileVerificationService.verifyOTP(
      dto.mobile,
      dto.otp,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Create session and tokens
    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user, sessionId, dto.channel),
      this.tokenService.generateRefreshToken(user.id, sessionId, tokenFamily),
    ]);

    // Create session
    await this.sessionService.createSession({
      id: sessionId,
      userId: user.id,
      deviceInfo: `${dto.channel}${dto.userAgent ? ` - ${dto.userAgent}` : ''}`,
      channel: dto.channel,
      refreshTokenFamily: tokenFamily,
      userAgent: dto.userAgent,
      metadata: {
        loginMethod: 'mobile_otp',
      },
    });

    // Update user's last login
    await this.userPort.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      sessionId,
    };
  }

  // mail login initialization
  async initiateMailLogin(
    dto: InitiateMailLoginDto,
  ): Promise<{ reference: string }> {
    this.logger.debug('Initiating mail login', {
      mail: dto.mail,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Check if user exists first
    const user = await this.userPort.findByIdentifier(dto.mail);
    if (!user) {
      throw new UnauthorizedException(
        'Please register before attempting to login. Registration requires both email and mobile number.',
      );
    }
    // Generate OTP using the new service
    const otp = this.otpService.generateToken(
      dto.mail,
      this.configService.get('TOPT_SECRET') || 'default-salt',
    );

    // Send the OTP via email
    await this.emailjsMailerService.sendOtpMail(dto.mail, dto.name, otp);
    return { reference: 'email is sent' };
  }
  // complete mail login
  async completeMailLogin(dto: CompleteMailLoginDto): Promise<{
    access_token: string;
    refresh_token: string;
    sessionId: string;
  }> {
    this.logger.debug('Completing mail login', {
      mail: dto.mail,
      channel: dto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    // Verify user exists with complete profile
    const user = await this.userPort.findByIdentifier(dto.mail);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.email || !user.mobile) {
      throw new UnauthorizedException(
        'Incomplete registration. Please complete registration with both email and mobile number.',
      );
    }

    // Verify OTP using the new service
    const isValid = this.otpService.verifyToken(
      dto.mail,
      this.configService.get('TOPT_SECRET') || 'default-salt',
      dto.otp,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Create session and tokens
    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user, sessionId, dto.channel),
      this.tokenService.generateRefreshToken(user.id, sessionId, tokenFamily),
    ]);

    // Create session
    await this.sessionService.createSession({
      id: sessionId,
      userId: user.id,
      deviceInfo: `${dto.channel}${dto.userAgent ? ` - ${dto.userAgent}` : ''}`,
      channel: dto.channel,
      refreshTokenFamily: tokenFamily,
      userAgent: dto.userAgent,
      metadata: {
        loginMethod: 'mobile_otp',
      },
    });

    // Update user's last login
    await this.userPort.update(user.id, {
      lastLoginAt: new Date(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      sessionId,
    };
  }

  // Check if user exists
  async isUserExists(
    type: 'email' | 'mobile',
    identifier: string,
  ): Promise<boolean> {
    this.logger.debug('Checking if user exists', {
      type,
      identifier,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const user = await this.userPort.findByIdentifier(identifier);
    return !!user;
  }
}
