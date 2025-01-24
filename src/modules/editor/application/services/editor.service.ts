import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { IEditorRepository } from '../../domain/ports/editor.repository';

@Injectable()
export class EditorService {
  constructor(private readonly editorRepository: IEditorRepository) {}
}
