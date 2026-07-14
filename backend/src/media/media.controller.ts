import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { MediaService } from './media.service';
import { MediaStatsService } from './media-stats.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { BulkUploadMediaDto } from './dto/bulk-upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { BulkDeleteMediaDto } from './dto/bulk-delete-media.dto';
import { CropMediaDto } from './dto/crop-media.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import {
  MEDIA_BULK_MAX_FILES,
  MEDIA_HARD_SIZE_CEILING_BYTES,
} from './constants/media-type-map';

const TMP_DIR = path.resolve('./storage/tmp');
fs.mkdirSync(TMP_DIR, { recursive: true });

// Hard ceiling enforced here (before any DB lookup is possible) as
// defense-in-depth against a request larger than any configured per-type
// limit could legitimately be. The real, configurable per-type limit is
// enforced afterward in MediaValidationService, once a DB lookup is safe.
const multerOptions = {
  storage: diskStorage({ destination: TMP_DIR }),
  limits: { fileSize: MEDIA_HARD_SIZE_CEILING_BYTES },
};

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly statsService: MediaStatsService,
  ) {}

  @Get()
  @RequirePermission('media.view')
  findAll(@Query() query: QueryMediaDto) {
    return this.mediaService.findAllAdmin(query);
  }

  @Get('meta/facets')
  @RequirePermission('media.view')
  getFacets() {
    return this.mediaService.getFacets();
  }

  @Get('meta/stats')
  @RequirePermission('media.view')
  getStats() {
    return this.statsService.getStats();
  }

  @Get(':id')
  @RequirePermission('media.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Get(':id/usages')
  @RequirePermission('media.view')
  getUsages(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.getUsages(id);
  }

  @Get(':id/versions')
  @RequirePermission('media.view')
  getVersions(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.getVersions(id);
  }

  @Post('upload')
  @RequirePermission('media.create')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.mediaService.upload(file, dto, req.user, req.requestId);
  }

  @Post('upload/bulk')
  @RequirePermission('media.create')
  @UseInterceptors(
    FilesInterceptor('files', MEDIA_BULK_MAX_FILES, multerOptions),
  )
  uploadBulk(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: BulkUploadMediaDto,
    @Request() req,
  ) {
    if (!files || files.length === 0)
      throw new BadRequestException('No files provided');
    return this.mediaService.bulkUpload(files, dto, req.user, req.requestId);
  }

  @Patch(':id')
  @RequirePermission('media.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaDto,
    @Request() req,
  ) {
    return this.mediaService.update(id, dto, req.user, req.requestId);
  }

  @Post(':id/replace')
  @RequirePermission('media.update')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  replace(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.mediaService.replace(id, file, req.user, req.requestId);
  }

  @Post(':id/versions/:versionId/rollback')
  @RequirePermission('media.update')
  rollback(
    @Param('id', ParseIntPipe) id: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @Request() req,
  ) {
    return this.mediaService.rollback(id, versionId, req.user, req.requestId);
  }

  @Post(':id/crops')
  @RequirePermission('media.update')
  crop(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CropMediaDto,
    @Request() req,
  ) {
    return this.mediaService.crop(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @RequirePermission('media.delete')
  softDelete(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force: string | undefined,
    @Request() req,
  ) {
    return this.mediaService.softDelete(
      id,
      req.user,
      req.requestId,
      force === 'true',
    );
  }

  @Post('bulk-delete')
  @RequirePermission('media.delete')
  bulkDelete(@Body() dto: BulkDeleteMediaDto, @Request() req) {
    return this.mediaService.bulkDelete(
      dto.ids,
      dto.force ?? false,
      req.user,
      req.requestId,
    );
  }

  @Post(':id/restore')
  @RequirePermission('media.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.mediaService.restore(id, req.user, req.requestId);
  }
}
