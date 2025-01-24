import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('creator')
@Controller('creator')
export class CreatorController {}
