import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { CareerApplicationsService } from './career-applications.service';
import { SubmitCareerApplicationDto } from './dto/submit-career-application.dto';
import { UpdateApplicationNotesDto } from './dto/update-application-notes.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AssignHrDto } from './dto/assign-hr.dto';
import { QueryCareerApplicationsDto } from './dto/query-career-applications.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { LocalDiskStorageAdapter } from '../media/storage/local-disk-storage.adapter';
import { MEDIA_HARD_SIZE_CEILING_BYTES } from '../media/constants/media-type-map';

const TMP_DIR = path.resolve('./storage/tmp');
fs.mkdirSync(TMP_DIR, { recursive: true });

const multerOptions = {
  storage: diskStorage({ destination: TMP_DIR }),
  limits: { fileSize: MEDIA_HARD_SIZE_CEILING_BYTES },
};

@ApiTags('career-applications')
@Controller('career-applications')
export class CareerApplicationsController {
  constructor(
    private readonly careerApplicationsService: CareerApplicationsService,
    private readonly prisma: PrismaService,
    private readonly storage: LocalDiskStorageAdapter,
  ) {}

  // Public - no guard. Rate-limited only via the duplicate-submission
  // window (see CareerApplicationsService.submit); resume validation
  // (extension/MIME/magic-byte/size) happens inside MediaService.upload,
  // reusing the exact same checks every other Media Library upload goes
  // through.
  @Post()
  @UseInterceptors(FileInterceptor('resume', multerOptions))
  submit(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: SubmitCareerApplicationDto,
    @Request() req,
  ) {
    return this.careerApplicationsService.submit(dto, file, req.requestId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.view')
  findAllAdmin(@Query() query: QueryCareerApplicationsDto) {
    return this.careerApplicationsService.findAllAdmin(query);
  }

  @Get('admin/dashboard-counts')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.view')
  getDashboardCounts() {
    return this.careerApplicationsService.getDashboardCounts();
  }

  @Get('admin/export/csv')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.export')
  async exportCsv(@Query() query: QueryCareerApplicationsDto, @Res() res: Response) {
    const csv = await this.careerApplicationsService.exportCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="career-applications.csv"');
    res.send(csv);
  }

  @Get('admin/export/excel')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.export')
  async exportExcel(@Query() query: QueryCareerApplicationsDto, @Res() res: Response) {
    const buffer = await this.careerApplicationsService.exportExcel(query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="career-applications.xlsx"');
    res.send(buffer);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.careerApplicationsService.findOne(id);
  }

  // Deliberately NOT served through the Media Library's public
  // /media/file/:id/:variant/:format route - resumes are PII and that
  // route has no auth guard (it's designed for public marketing assets
  // like gallery photos). This streams the same underlying file through a
  // permission-gated route instead.
  @Get('admin/:id/resume')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.view')
  async downloadResume(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const application = await this.prisma.careerApplication.findUnique({ where: { id } });
    if (!application) throw new NotFoundException(`Application ${id} not found`);

    const media = await this.prisma.media.findUnique({ where: { id: application.resumeMediaId } });
    if (!media) throw new NotFoundException('Resume file no longer exists');

    const variant = await this.prisma.mediaVariant.findFirst({
      where: { mediaId: media.id, variant: 'ORIGINAL', format: 'SOURCE' },
    });
    if (!variant) throw new NotFoundException('Resume file not found');

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${application.fullName.replace(/[^a-z0-9]/gi, '_')}_resume${path.extname(media.originalFilename)}"`,
    );
    const stream = this.storage.createReadStream(variant.storageKey);
    stream.on('error', () => {
      if (!res.headersSent) res.status(404).end();
      else res.end();
    });
    stream.pipe(res);
  }

  @Patch('admin/:id/notes')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.update')
  updateNotes(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationNotesDto,
    @Request() req,
  ) {
    return this.careerApplicationsService.updateNotes(id, dto, req.user, req.requestId);
  }

  @Post('admin/:id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.update')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req,
  ) {
    return this.careerApplicationsService.updateStatus(id, dto, req.user, req.requestId);
  }

  @Post('admin/:id/assign-hr')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('career_applications.update')
  assignHr(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignHrDto,
    @Request() req,
  ) {
    return this.careerApplicationsService.assignHr(id, dto, req.user, req.requestId);
  }
}
