import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Editor } from './infrastructure/entities/editor.entity';
import { EditorRepository } from './infrastructure/adapters/editor.repository';
import { EditorService } from './application/services/editor.service';
import { EditorController } from './presentation/controllers/editor.controller';
import { IEditorRepository } from './domain/ports/editor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Editor])],
  controllers: [EditorController],
  providers: [
    EditorService,
    {
      provide: IEditorRepository,
      useClass: EditorRepository,
    },
  ],
})
export class EditorModule {}
