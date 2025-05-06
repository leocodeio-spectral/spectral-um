import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ValidationService } from '../../application/services/validation.service';
import { IsPhoneValidDto } from '../../application/dtos/is-phone-valid.dto';
import { IsEmailValidDto } from '../../application/dtos/is-email-valid.dto';
import { ExistsPhoneDto } from '../../application/dtos/exists-phone.dto';
import { ExistsEmailDto } from '../../application/dtos/exists-email.dto';
import { IUserPort } from 'src/modules/user/domain/ports/user.port';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { AuthExceptionFilter } from 'src/utils/filters/auth-exceptions.filter';
import { ValidateTokenDto } from '../../application/dtos/validate-token.dto';
import { AuthService } from 'src/utils/services/auth.service';
import { Request } from 'express';

@Controller('validate')
@ApiSecurity('x-api-key')
@ApiSecurity('Authorization')
export class ValidationController {
  constructor(
    private readonly validationService: ValidationService,
    private readonly authService: AuthService,
    private readonly userRepository: IUserPort,
  ) {}
  // IsPhone valid
  @Post('phone')
  async isPhoneValid(
    @Body() isPhoneValidDto: IsPhoneValidDto,
  ): Promise<boolean> {
    return this.validationService.isPhoneValid(isPhoneValidDto);
  }

  @Post('/exists/phone')
  async existsPhone(@Body() existsPhoneDto: ExistsPhoneDto): Promise<boolean> {
    const user = await this.userRepository.findByIdentifier(
      existsPhoneDto.phone,
    );
    return user !== null;
  }

  // IsEmail valid
  @Post('email')
  async isEmailValid(
    @Body() isEmailValidDto: IsEmailValidDto,
  ): Promise<boolean> {
    return this.validationService.isEmailValid(isEmailValidDto);
  }

  @Post('exists/email')
  async existsEmail(@Body() existsEmailDto: ExistsEmailDto): Promise<boolean> {
    const user = await this.userRepository.findByIdentifier(
      existsEmailDto.email,
    );
    return user !== null;
  }

  // IsAcessTokenValid
  // IsRefreshTokenValid
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'User validate' })
  @Post('acesstoken')
  @UseFilters(AuthExceptionFilter)
  async validateToken(
    @Req() req: Request,
    @Body() validateTokenDto: ValidateTokenDto,
  ) {
    const isValid = await this.authService.validateToken(
      req.user.id,
      validateTokenDto.channel,
      validateTokenDto.clientId,
      req.user.baseUrl,
      req.user.baseMethod,
    );

    return {
      valid: isValid,
      userId: req.user.id,
      channel: validateTokenDto.channel,
    };
  }
}
