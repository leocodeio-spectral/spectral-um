import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
// creator editor
import { CreatorEditorMapService } from '../../application/services/map.service';
import { CreateCreatorEditorMapDto } from '../../application/dtos/create-creator-editor-map.dto';
import { UpdateCreatorEditorMapDto } from '../../application/dtos/update-creator-editor-map.dto';

// account editor
import { AccountEditorMapService } from '../../application/services/map.service';
import { CreateAccountEditorMapDto } from '../../application/dtos/create-account-editor-map.dto';
import { UpdateAccountEditorMapDto } from '../../application/dtos/update-account-editor-map.dto';

@Controller('creator-editor-map')
export class CreatorEditorMapController {
  constructor(
    private readonly creatorEditorMapService: CreatorEditorMapService,
  ) {}

  @Get()
  async findAll() {
    return this.creatorEditorMapService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.creatorEditorMapService.findById(id);
  }

  @Post()
  async create(@Body() createCreatorEditorMapDto: CreateCreatorEditorMapDto) {
    return this.creatorEditorMapService.create(createCreatorEditorMapDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCreatorEditorMapDto: UpdateCreatorEditorMapDto,
  ) {
    return this.creatorEditorMapService.update(id, updateCreatorEditorMapDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.creatorEditorMapService.delete(id);
  }
}

// account - editor map
@Controller('account-editor-map')
export class AccountEditorMapController {
  constructor(
    private readonly accountEditorMapService: AccountEditorMapService,
  ) {}

  @Get()
  async findAll() {
    return this.accountEditorMapService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.accountEditorMapService.findById(id);
  }

  @Post()
  async create(@Body() createAccountEditorMapDto: CreateAccountEditorMapDto) {
    return this.accountEditorMapService.create(createAccountEditorMapDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountEditorMapDto: UpdateAccountEditorMapDto,
  ) {
    return this.accountEditorMapService.update(id, updateAccountEditorMapDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.accountEditorMapService.delete(id);
  }
}
