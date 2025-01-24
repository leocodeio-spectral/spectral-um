import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('editor')
@Controller('editor')
export class EditorController {}
