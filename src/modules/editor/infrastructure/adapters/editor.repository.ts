import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Editor } from '../entities/editor.entity';
import { IEditorRepository } from '../../domain/ports/editor.repository';

@Injectable()
export class EditorRepository implements IEditorRepository {
  constructor(
    @InjectRepository(Editor)
    private readonly editorRepository: Repository<Editor>,
  ) {}
}
