import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  OTP_REPOSITORY,
  USER_PREFERENCES_REPOSITORY,
  USER_REPOSITORY,
} from '../../../../utils/services/constants';
import * as bcrypt from 'bcryptjs';
import { AuthPolicyService } from '../../../../utils/services/auth-policy.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from 'src/modules/user/application/dtos/register.dto';
import { UserProfileDto } from 'src/modules/user/application/dtos/user-profile.dto';
import { userStatus } from 'src/modules/user/domain/enums/user_status.enum';
import { UpdateDto } from 'src/modules/user/application/dtos/update.dto';
import { IUser } from 'src/modules/user/domain/models/user.model';
import { IUserPort } from 'src/modules/user/domain/ports/user.port';
import { IUserPreferencesPort } from 'src/modules/user/domain/ports/user-preferences.port';
import { IOtpPort } from 'src/modules/otp/domain/ports/otp.port';
import { EmailjsMailerService } from 'src/modules/otp/application/services/emailjs-mailer.service';

@Injectable()
export class UserRegistrationService {
  constructor(
    private readonly userPort: IUserPort,
    private readonly userPrefPort: IUserPreferencesPort,
    private readonly otpPort: IOtpPort,
    private readonly authPolicyService: AuthPolicyService,
    private readonly configService: ConfigService,
    private readonly emailjsMailerService: EmailjsMailerService,
  ) {}

  async register(dto: RegisterDto): Promise<UserProfileDto> {
    // validation checks
    const emailUsed = await this.userPort.findByIdentifier(dto.email);
    if (emailUsed) {
      throw new ConflictException('Email is already in use');
    }
    const mobileUsed = await this.userPort.findByIdentifier(dto.mobile);
    if (mobileUsed) {
      throw new ConflictException('Mobile number is already in use');
    }
    // MOBILE_VERIFICATION
    if (
      this.configService.get<boolean>('MOBILE_VERIFICATION') &&
      (dto.channel === 'mobile' || dto.channel === 'web')
    ) {
      const isValidOTP = await this.otpPort.verify(
        dto.mobile,
        dto.mobileVerificationCode!,
      );
      console.log('isValidOTP', isValidOTP);
      if (!isValidOTP) {
        throw new UnauthorizedException('Invalid mobile verification code');
      }
    }

    // EMAIL_VERIFICATION
    if (
      this.configService.get<boolean>('MAIL_VERIFICATION') &&
      (dto.channel === 'email' || dto.channel === 'web')
    ) {
      const isValid = this.emailjsMailerService.verifyOtpMail(
        dto.email,
        dto.mailVerificationCode!,
      );
      console.log('isValid', isValid);
      if (!isValid) {
        throw new UnauthorizedException('Invalid email verification code');
      }
    }

    // Hash password
    const passwordHash = await this.hashPassword(dto.password);

    // Determine access level
    const accessLevel = this.authPolicyService.determineUserAccessLevel({
      email: dto.email,
      mobile: dto.mobile,
      firstName: dto.firstName,
      lastName: dto.lastName,
      profilePicUrl: dto.profilePicUrl,
      passwordHash,
      status: userStatus.ACTIVE,
      allowedChannels: ['mobile', 'web'],
      twoFactorEnabled: false,
    } as IUser);

    const user = await this.userPort.save({
      email: dto.email,
      mobile: dto.mobile,
      firstName: dto.firstName,
      lastName: dto.lastName,
      profilePicUrl: dto.profilePicUrl,
      passwordHash,
      status: userStatus.ACTIVE,
      allowedChannels: ['mobile', 'web'],
      accessLevel: accessLevel,
      twoFactorEnabled: false,
    });

    const userPreferences = await this.userPrefPort.save({
      userId: user.id,
      language: dto.language,
      theme: dto.theme,
      timeZone: dto.timeZone,
    });

    if (!userPreferences) {
      throw new UnauthorizedException('User preferences not found');
    }

    return {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicUrl: user.profilePicUrl as string,
      language: userPreferences.language!,
      theme: userPreferences.theme!,
      timeZone: userPreferences.timeZone!,
      accessLevel: user.accessLevel,
      twoFactorEnabled: user.twoFactorEnabled,
      allowedChannels: user.allowedChannels,
      createdAt: user.createdAt,
    };
  }

  async update(dto: UpdateDto, id: string): Promise<UserProfileDto> {
    const user = await this.userPort.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updatedUser = await this.userPort.update(id, {
      email: dto.email ? dto.email : user.email,
      mobile: dto.mobile ? dto.mobile : user.mobile,
      passwordHash: dto.password
        ? await this.hashPassword(dto.password)
        : user.passwordHash,
      firstName: dto.firstName ? dto.firstName : user.firstName,
      lastName: dto.lastName ? dto.lastName : user.lastName,
      profilePicUrl: dto.profilePicUrl ? dto.profilePicUrl : user.profilePicUrl,
      allowedChannels: dto.channel
        ? [dto.channel, ...user.allowedChannels]
        : user.allowedChannels,
      twoFactorEnabled: user.twoFactorEnabled,
      status: dto.status ? (dto.status as userStatus) : user.status,
      updatedAt: new Date(),
    });

    const userPreferences = await this.userPrefPort.findByUserId(id);
    if (!userPreferences) {
      throw new UnauthorizedException('User preferences not found');
    }
    const updatedUserPreferences = await this.userPrefPort.update(id, {
      language: dto.language ? dto.language : userPreferences.language,
      theme: dto.theme ? dto.theme : userPreferences.theme,
      timeZone: dto.timeZone ? dto.timeZone : userPreferences.timeZone,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profilePicUrl: updatedUser.profilePicUrl as string,
      language: updatedUserPreferences.language,
      theme: updatedUserPreferences.theme,
      timeZone: updatedUserPreferences.timeZone,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      allowedChannels: updatedUser.allowedChannels,
      accessLevel: updatedUser.accessLevel,
      createdAt: updatedUser.createdAt,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}
