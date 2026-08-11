import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DownloadCategory } from '@prisma/client';
import { DownloadsService } from './downloads.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';
import { ReorderDownloadsDto } from './dto/reorder-downloads.dto';
import { BulkCreateDownloadsDto } from './dto/bulk-create-downloads.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';
import { PageSectionOwnershipGuard } from '../auth/page-section-ownership.guard';
import { PageSectionScoped } from '../auth/page-section.decorator';

@ApiTags('downloads')
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get()
  findAllPublic(
    @Query('category') category?: DownloadCategory,
    @Query('departmentId') departmentId?: string,
    @Query('pageSection') pageSection?: string,
  ) {
    return this.downloadsService.findAllPublic(
      category,
      departmentId ? parseInt(departmentId) : undefined,
      pageSection,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.view')
  findAllAdmin(
    @Query('includeDeleted') includeDeleted?: string,
    @Query('departmentId') departmentId?: string,
    @Query('mediaId') mediaId?: string,
  ) {
    return this.downloadsService.findAllAdmin(
      includeDeleted === 'true',
      departmentId ? parseInt(departmentId) : undefined,
      mediaId ? parseInt(mediaId) : undefined,
    );
  }

  @Post()
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
    DepartmentOwnershipGuard,
    PageSectionOwnershipGuard,
  )
  @RequirePermission('downloads.create')
  @DepartmentScoped({ source: 'body' })
  @PageSectionScoped({ source: 'body' })
  create(@Body() dto: CreateDownloadDto, @Request() req) {
    return this.downloadsService.create(dto, req.user, req.requestId);
  }

  // Declared before @Patch(':id')/@Post(':id/...') so "bulk" is never parsed
  // as a record id.
  @Post('bulk')
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
    DepartmentOwnershipGuard,
    PageSectionOwnershipGuard,
  )
  @RequirePermission('downloads.create')
  @DepartmentScoped({ source: 'body' })
  // The batch shares one pageSection across every item, so the body-level
  // value is authoritative for the whole request.
  @PageSectionScoped({ source: 'body' })
  bulkCreate(@Body() dto: BulkCreateDownloadsDto, @Request() req) {
    return this.downloadsService.bulkCreate(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.update')
  reorder(@Body() dto: ReorderDownloadsDto, @Request() req) {
    return this.downloadsService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
    DepartmentOwnershipGuard,
    PageSectionOwnershipGuard,
  )
  @PageSectionScoped({ source: 'lookup', model: 'download' })
  @RequirePermission('downloads.update')
  @DepartmentScoped({ source: 'lookup', model: 'download' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDownloadDto,
    @Request() req,
  ) {
    return this.downloadsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
    DepartmentOwnershipGuard,
    PageSectionOwnershipGuard,
  )
  @PageSectionScoped({ source: 'lookup', model: 'download' })
  @RequirePermission('downloads.delete')
  @DepartmentScoped({ source: 'lookup', model: 'download' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.downloadsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(
    JwtAuthGuard,
    PermissionsGuard,
    DepartmentOwnershipGuard,
    PageSectionOwnershipGuard,
  )
  @PageSectionScoped({ source: 'lookup', model: 'download' })
  @RequirePermission('downloads.restore')
  @DepartmentScoped({ source: 'lookup', model: 'download' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.downloadsService.restore(id, req.user, req.requestId);
  }
}
