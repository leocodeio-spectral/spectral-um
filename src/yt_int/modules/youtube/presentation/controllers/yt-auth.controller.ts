import {
  Controller,
  Get,
  Query,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { YtAuthService } from '../../application/services/yt-auth.service';
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public } from '@leocodeio-njs/njs-auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { slugCallbackDataDto } from '../../application/dtos/callback-slug.dto';

@ApiTags('Youtube')
@ApiSecurity('x-api-key')
@Controller('youtube/api')
export class YtAuthController {
  constructor(private readonly ytAuthService: YtAuthService) {}

  // YouTube connect endpoints
  @Get('auth')
  async authenticateYouTube() {
    return this.ytAuthService.getAuthUrl();
  }

  @Post('oauth2callback')
  @ApiBody({ type: slugCallbackDataDto })
  async handleOAuthCallback(@Body() slugCallbackData: slugCallbackDataDto) {
    const creatorId =
      await this.ytAuthService.handleOAuthCallback(slugCallbackData);
    return creatorId;
  }

  @Get('channel-info')
  async getChannelInfo(@Query('id') id: string) {
    return this.ytAuthService.getChannelInfo(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @Query('id') id: string,
    @UploadedFile() videoFile: Express.Multer.File,
    @Body()
    metadata: {
      title: string;
      description: string;
      tags?: string;
      privacyStatus?: 'private' | 'unlisted' | 'public';
    },
  ) {
    return this.ytAuthService.uploadVideo(id, videoFile, {
      ...metadata,
      tags: metadata.tags ? metadata.tags.split(',') : undefined,
    });
  }

  @Get('get-token-validity')
  async getTokenValidity(@Query('token') token: string) {
    return this.ytAuthService.getTokenValidity(token);
  }

  @Get('refresh-token')
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    return this.ytAuthService.refreshToken(refreshToken);
  }
}
