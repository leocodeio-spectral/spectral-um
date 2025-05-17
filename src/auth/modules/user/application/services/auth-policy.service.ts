import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CREATOR_REPOSITORY,
  EDITOR_REPOSITORY,
} from 'src/auth/libs/services/constants';
import { Repository } from 'typeorm';
import { Creator, Editor } from '../../infrastructure/entities/user.entity';
import { ICreator, IEditor } from '../../domain/models/user.model';
import { userStatus } from '../../domain/enums/user_status.enum';
import { AccessLevel } from '../../domain/enums/access-level.enum';

// Define channels for clarity
export enum Channel {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
}

@Injectable()
export class CreatorAuthPolicyService {
  private readonly logger = new Logger(CreatorAuthPolicyService.name);

  constructor(
    @Inject(CREATOR_REPOSITORY)
    private readonly repository: Repository<Creator>,
  ) {}

  /**
   * Check if a user is authorized for a specific channel
   * @param user User entity
   * @param channel Channel to check authorization for
   * @returns boolean indicating if user is authorized
   */
  isChannelAuthorized(user: ICreator, channel: string): boolean {
    // Quick check for API channel which might have special rules
    if (channel === Channel.API) {
      return true;
    }

    // Make sure user is active before checking channel access
    if (user.status !== userStatus.ACTIVE) {
      this.logger.debug(`User ${user.id} not active, denying channel access`);
      throw new UnauthorizedException('User not active');
    }

    const isAuthorized = user.allowedChannels.includes(channel);

    if (!isAuthorized) {
      this.logger.debug(
        `User ${user.id} not authorized for channel ${channel}`,
      );
      throw new UnauthorizedException('User not authorized for channel');
    }

    return isAuthorized;
  }

  /**
   * Determine user's access level based on attributes and history
   * @param user User entity
   * @returns AccessLevel enum value
   */
  determineUserAccessLevel(user: ICreator): AccessLevel {
    // Basic case - if user is not active, no access
    if (user.status !== userStatus.ACTIVE) {
      return AccessLevel.NONE;
    }

    // Default to basic access
    let accessLevel = AccessLevel.USER;

    // Determine access level based on user attributes and history
    // 1. Check if user has completed profile
    const hasCompleteProfile = !!(
      user.email &&
      user.mobile &&
      user.firstName &&
      user.lastName
    );

    // 2. Check if user has verified their identity (e.g., mobile verification)
    const hasVerifiedIdentity = user.mobile ? true : false; // Assuming mobile number presence means it's verified

    // 3. Check for 2FA activation which might give elevated privileges
    const hasTwoFactor = user.twoFactorEnabled;

    // 4. Look at user's history like account age
    const accountAgeInDays = user.createdAt
      ? Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    // Logic to determine level based on the above factors
    if (hasCompleteProfile && hasVerifiedIdentity) {
      // accessLevel = AccessLevel.STANDARD;

      // if (hasTwoFactor && accountAgeInDays > 30) {
      //   accessLevel = AccessLevel.ELEVATED;
      // }

      // Admin level might be set elsewhere or through a specific check
      // This is just a placeholder for your actual admin determination logic
      if (user.email?.endsWith('@admin.yourcompany.com')) {
        accessLevel = AccessLevel.ADMIN;
      }
    }

    this.logger.debug(
      `Determined access level for user ${user.id}: ${accessLevel}`,
    );

    return accessLevel;
  }

  /**
   * Check if a user has permission to access a specific resource
   * @param user User entity
   * @param baseUrl Base URL of the request
   * @param baseMethod Action being performed (read, write, delete)
   * @returns boolean indicating if access is allowed
   */
  async canAccessResource(
    baseUrl?: string,
    user?: ICreator,
    baseMethod?: string,
  ): Promise<boolean> {
    try {
      // Parse the URL to extract feature and function name
      if (!baseUrl) {
        return true;
      }

      const urlFragments = baseUrl.split('/');
      this.logger.debug('urlFragments', { urlFragments });

      // Extract domain, version, feature, and functionName from URL
      const domain = urlFragments?.[2];
      const version = urlFragments?.[3];
      const feature = urlFragments?.[4];

      // Handle URL parameters by replacing them with a placeholder
      // This includes :id format, UUIDs, and numeric IDs
      const normalizedFragments = urlFragments?.slice(5).map((fragment) => {
        // Check if it's a parameter in :id format
        if (fragment.startsWith(':')) return ':id';

        // Check if it's a UUID
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            fragment,
          )
        )
          return ':id';

        // Check if it's a numeric ID
        if (/^\d+$/.test(fragment)) return ':id';

        // Otherwise, keep the fragment as is
        return fragment;
      });

      const functionName = normalizedFragments.join('/');

      this.logger.debug('URL components', {
        domain,
        version,
        feature,
        functionName,
        baseUrl,
        baseMethod,
        accessLevel: user?.accessLevel || 'user', // Default to 'user' if role not specified
      });

      // Get the user's role (default to 'user' if not specified)
      const role = user?.accessLevel || 'user';

      // Use the repository's query builder to execute the function
      const result = await this.repository
        .createQueryBuilder()
        .select(
          'auth.check_permission(:role, :feature, :functionName, :method)',
          'has_access',
        )
        .setParameters({
          role,
          feature,
          functionName: functionName.replace(/\?.*/, ''), // ignore params
          method: baseMethod?.toLowerCase(),
        })
        .getRawOne();

      const hasAccess = result?.has_access || false;

      if (!hasAccess) {
        throw new UnauthorizedException(
          'User does not have access to resource',
        );
      }

      this.logger.debug('Permission check result', {
        hasAccess,
        role,
        feature,
        functionName,
        method: baseMethod?.toLowerCase(),
      });

      return hasAccess;
    } catch (error) {
      this.logger.error('Error checking resource access', {
        error: error.message,
        stack: error.stack,
      });
      return false; // Default to denying access on error
    }
  }

  /**
   * Validate token usage for specific channel and client
   * @param user User entity
   * @param channel Channel the token is being used in
   * @param clientId Optional client identifier for API tokens
   * @returns boolean indicating if token usage is valid
   */
  isTokenUsageValid(
    user: ICreator,
    channel: string,
    clientId?: string,
  ): boolean {
    // Check channel authorization
    if (!this.isChannelAuthorized(user, channel)) {
      return false;
    }

    // Special handling for API channel
    if (channel === Channel.API && clientId) {
      // This is a placeholder - implement your API client validation logic
      const validApiClients = ['validMicroservice', 'authorizedClient'];
      return validApiClients.includes(clientId);
    }

    return true;
  }

  /**
   * Check if user meets requirements for 2FA setup
   * @param user User entity
   * @returns boolean indicating if user can set up 2FA
   */
  canSetup2FA(user: ICreator): boolean {
    return user.status === userStatus.ACTIVE && !!user.email && !!user.mobile;
  }
}

@Injectable()
export class EditorAuthPolicyService {
  private readonly logger = new Logger(EditorAuthPolicyService.name);

  constructor(
    @Inject(EDITOR_REPOSITORY) private readonly repository: Repository<Editor>,
  ) {}

  /**
   * Check if a user is authorized for a specific channel
   * @param user User entity
   * @param channel Channel to check authorization for
   * @returns boolean indicating if user is authorized
   */
  isChannelAuthorized(user: IEditor, channel: string): boolean {
    // Quick check for API channel which might have special rules
    if (channel === Channel.API) {
      return true;
    }

    // Make sure user is active before checking channel access
    if (user.status !== userStatus.ACTIVE) {
      this.logger.debug(`User ${user.id} not active, denying channel access`);
      throw new UnauthorizedException('User not active');
    }

    const isAuthorized = user.allowedChannels.includes(channel);

    if (!isAuthorized) {
      this.logger.debug(
        `User ${user.id} not authorized for channel ${channel}`,
      );
      throw new UnauthorizedException('User not authorized for channel');
    }

    return isAuthorized;
  }

  /**
   * Determine user's access level based on attributes and history
   * @param user User entity
   * @returns AccessLevel enum value
   */
  determineUserAccessLevel(user: IEditor): AccessLevel {
    // Basic case - if user is not active, no access
    if (user.status !== userStatus.ACTIVE) {
      return AccessLevel.NONE;
    }

    // Default to basic access
    let accessLevel = AccessLevel.USER;

    // Determine access level based on user attributes and history
    // 1. Check if user has completed profile
    const hasCompleteProfile = !!(
      user.email &&
      user.mobile &&
      user.firstName &&
      user.lastName
    );

    // 2. Check if user has verified their identity (e.g., mobile verification)
    const hasVerifiedIdentity = user.mobile ? true : false; // Assuming mobile number presence means it's verified

    // 3. Check for 2FA activation which might give elevated privileges
    const hasTwoFactor = user.twoFactorEnabled;

    // 4. Look at user's history like account age
    const accountAgeInDays = user.createdAt
      ? Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : 0;

    // Logic to determine level based on the above factors
    if (hasCompleteProfile && hasVerifiedIdentity) {
      // accessLevel = AccessLevel.STANDARD;

      // if (hasTwoFactor && accountAgeInDays > 30) {
      //   accessLevel = AccessLevel.ELEVATED;
      // }

      // Admin level might be set elsewhere or through a specific check
      // This is just a placeholder for your actual admin determination logic
      if (user.email?.endsWith('@admin.yourcompany.com')) {
        accessLevel = AccessLevel.ADMIN;
      }
    }

    this.logger.debug(
      `Determined access level for user ${user.id}: ${accessLevel}`,
    );

    return accessLevel;
  }

  /**
   * Check if a user has permission to access a specific resource
   * @param user User entity
   * @param baseUrl Base URL of the request
   * @param baseMethod Action being performed (read, write, delete)
   * @returns boolean indicating if access is allowed
   */
  async canAccessResource(
    baseUrl?: string,
    user?: IEditor,
    baseMethod?: string,
  ): Promise<boolean> {
    try {
      // Parse the URL to extract feature and function name
      if (!baseUrl) {
        return true;
      }

      const urlFragments = baseUrl.split('/');
      this.logger.debug('urlFragments', { urlFragments });

      // Extract domain, version, feature, and functionName from URL
      const domain = urlFragments?.[2];
      const version = urlFragments?.[3];
      const feature = urlFragments?.[4];

      // Handle URL parameters by replacing them with a placeholder
      // This includes :id format, UUIDs, and numeric IDs
      const normalizedFragments = urlFragments?.slice(5).map((fragment) => {
        // Check if it's a parameter in :id format
        if (fragment.startsWith(':')) return ':id';

        // Check if it's a UUID
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            fragment,
          )
        )
          return ':id';

        // Check if it's a numeric ID
        if (/^\d+$/.test(fragment)) return ':id';

        // Otherwise, keep the fragment as is
        return fragment;
      });

      const functionName = normalizedFragments.join('/');

      this.logger.debug('URL components', {
        domain,
        version,
        feature,
        functionName,
        baseUrl,
        baseMethod,
        accessLevel: user?.accessLevel || 'user', // Default to 'user' if role not specified
      });

      // Get the user's role (default to 'user' if not specified)
      const role = user?.accessLevel || 'user';

      // Use the repository's query builder to execute the function
      const result = await this.repository
        .createQueryBuilder()
        .select(
          'auth.check_permission(:role, :feature, :functionName, :method)',
          'has_access',
        )
        .setParameters({
          role,
          feature,
          functionName: functionName.replace(/\?.*/, ''), // ignore params
          method: baseMethod?.toLowerCase(),
        })
        .getRawOne();

      const hasAccess = result?.has_access || false;

      if (!hasAccess) {
        throw new UnauthorizedException(
          'User does not have access to resource',
        );
      }

      this.logger.debug('Permission check result', {
        hasAccess,
        role,
        feature,
        functionName,
        method: baseMethod?.toLowerCase(),
      });

      return hasAccess;
    } catch (error) {
      this.logger.error('Error checking resource access', {
        error: error.message,
        stack: error.stack,
      });
      return false; // Default to denying access on error
    }
  }

  /**
   * Validate token usage for specific channel and client
   * @param user User entity
   * @param channel Channel the token is being used in
   * @param clientId Optional client identifier for API tokens
   * @returns boolean indicating if token usage is valid
   */
  isTokenUsageValid(
    user: IEditor,
    channel: string,
    clientId?: string,
  ): boolean {
    // Check channel authorization
    if (!this.isChannelAuthorized(user, channel)) {
      return false;
    }

    // Special handling for API channel
    if (channel === Channel.API && clientId) {
      // This is a placeholder - implement your API client validation logic
      const validApiClients = ['validMicroservice', 'authorizedClient'];
      return validApiClients.includes(clientId);
    }

    return true;
  }

  /**
   * Check if user meets requirements for 2FA setup
   * @param user User entity
   * @returns boolean indicating if user can set up 2FA
   */
  canSetup2FA(user: IEditor): boolean {
    return user.status === userStatus.ACTIVE && !!user.email && !!user.mobile;
  }
}
