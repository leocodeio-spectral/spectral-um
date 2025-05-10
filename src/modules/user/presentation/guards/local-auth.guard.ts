import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class CreatorLocalAuthGuard extends AuthGuard('creator-local') {}

@Injectable()
export class EditorLocalAuthGuard extends AuthGuard('editor-local') {}
