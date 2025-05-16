import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import {
  CreatorAuthPolicyService,
  EditorAuthPolicyService,
} from './auth-policy.service';
import { ConfigService } from '@nestjs/config';
import { ICreatorPort, IEditorPort } from '../../domain/ports/user.port';
import { IOtpPort } from 'src/auth/modules/otp/domain/ports/otp.port';
import {
  ICreatorPreferencesPort,
  IEditorPreferencesPort,
} from '../../domain/ports/user-preferences.port';
import { EmailjsMailerService } from 'src/auth/modules/otp/application/services/emailjs-mailer.service';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { RegisterDto } from '../dtos/register.dto';
import { userStatus } from '../../domain/enums/user_status.enum';
import { ICreator, IEditor } from '../../domain/models/user.model';
import { UpdateDto } from '../dtos/update.dto';

@Injectable()
export class CreatorRegistrationService {
  constructor(
    private readonly userPort: ICreatorPort,
    private readonly userPrefPort: ICreatorPreferencesPort,
    private readonly otpPort: IOtpPort,
    private readonly authPolicyService: CreatorAuthPolicyService,
    private readonly configService: ConfigService,
    private readonly emailjsMailerService: EmailjsMailerService,
  ) {}

  async register(dto: RegisterDto): Promise<UserProfileDto> {
    console.log(3);
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
      console.log(4);
      const isValid = await this.emailjsMailerService.verifyOtpMail(
        dto.email,
        dto.mailVerificationCode!,
      );
      console.log('isValid', isValid);
      if (!isValid) {
        throw new UnauthorizedException('Invalid email verification code');
      }
    }

    // Hash password
    console.log(5);
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
    } as ICreator);
    console.log(6);
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
    console.log(7);
    const userPreferences = await this.userPrefPort.save({
      creatorId: user.id,
      language: dto.language,
      theme: dto.theme,
      timeZone: dto.timeZone,
    });
    console.log(8);
    if (!userPreferences) {
      throw new UnauthorizedException('User preferences not found');
    }
    console.log(9);
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
      role: user.role,
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
      role: updatedUser.role,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}

@Injectable()
export class EditorRegistrationService {
  constructor(
    private readonly userPort: IEditorPort,
    private readonly userPrefPort: IEditorPreferencesPort,
    private readonly otpPort: IOtpPort,
    private readonly authPolicyService: EditorAuthPolicyService,
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
      const isValid = await this.emailjsMailerService.verifyOtpMail(
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
    } as IEditor);

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
      editorId: user.id,
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
      role: user.role,
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
      role: updatedUser.role,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}
