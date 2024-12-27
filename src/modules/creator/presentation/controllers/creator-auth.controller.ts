import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { CreatorAuthService } from '../../application/services/creator-auth.service';
import { RegisterCreatorDto } from '../../application/dtos/register-creator.dto';
import { LoginCreatorDto } from '../../application/dtos/login-creator.dto';
import { Creator } from '../../infrastructure/entities/creator.entity';
import { AuthResponse } from '../../domain/interfaces/auth.interface';
import { ResponseService } from 'src/common/services/response.service';
import { ApiResponse } from 'src/common/interfaces/response.interface';


@ApiTags('auth')
@Controller('api/v1/creators/auth')
export class CreatorAuthController {
  constructor(
    private readonly creatorAuthService: CreatorAuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new creator' })
  @SwaggerResponse({ status: 201, description: 'Creator successfully registered.' })
  @SwaggerResponse({ status: 400, description: 'Bad Request.' })
  @SwaggerResponse({ status: 409, description: 'Email already exists.' })
  async register(@Body() dto: RegisterCreatorDto): Promise<ApiResponse<Omit<Creator, 'password'>>> {
    const creator = await this.creatorAuthService.register(dto);
    return this.responseService.success(
      creator,
      'Creator registered successfully',
      HttpStatus.CREATED,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login creator' })
  @SwaggerResponse({ status: 200, description: 'Login successful.' })
  @SwaggerResponse({ status: 401, description: 'Unauthorized.' })
  async login(@Body() dto: LoginCreatorDto): Promise<ApiResponse<AuthResponse>> {
    const authData = await this.creatorAuthService.login(dto);
    return this.responseService.success(
      authData,
      'Login successful',
      HttpStatus.OK,
    );
  }
} 