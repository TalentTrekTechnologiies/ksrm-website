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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('downloads')
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get()
  findAllPublic(@Query('category') category?: DownloadCategory) {
    return this.downloadsService.findAllPublic(category);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.downloadsService.findAllAdmin(includeDeleted === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.create')
  create(@Body() dto: CreateDownloadDto, @Request() req) {
    return this.downloadsService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.update')
  reorder(@Body() dto: ReorderDownloadsDto, @Request() req) {
    return this.downloadsService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDownloadDto,
    @Request() req,
  ) {
    return this.downloadsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.downloadsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.downloadsService.restore(id, req.user, req.requestId);
  }
}
