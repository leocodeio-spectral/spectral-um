import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreatorRepository } from '../../infrastructure/adapters/creator.repository';
import { RegisterCreatorDto } from '../dtos/register-creator.dto';
import { LoginCreatorDto } from '../dtos/login-creator.dto';
import { Creator } from '../../infrastructure/entities/creator.entity';
import { AuthResponse } from '../../domain/interfaces/auth.interface';

@Injectable()
export class CreatorAuthService {
  constructor(
    private readonly creatorRepository: CreatorRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterCreatorDto): Promise<Omit<Creator, 'password'>> {
    const existingCreator = await this.creatorRepository.findByEmail(dto.email);
    if (existingCreator) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    const creator = await this.creatorRepository.create({
      ...dto,
      password: hashedPassword,
      status: true,
      created_at: new Date(),
    });

    const { password, ...result } = creator;
    return result;
  }

  async login(dto: LoginCreatorDto): Promise<AuthResponse> {
    const creator = await this.creatorRepository.findByEmail(dto.email);
    if (!creator) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, creator.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: creator.id, email: creator.email };
    
    return {
      access_token: await this.jwtService.signAsync(payload),
      creator: {
        id: creator.id,
        email: creator.email,
        first_name: creator.first_name,
        last_name: creator.last_name,
        profile_pic_url: creator.profile_pic_url,
      },
    };
  }
} 