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
import { GalleryService } from './gallery.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { ReorderGalleryImagesDto } from './dto/reorder-gallery-images.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  findAllPublic(
    @Query('category') category?: string,
    @Query('departmentId') departmentId?: string,
    @Query('pageSection') pageSection?: string,
  ) {
    return this.galleryService.findAllPublic(
      category,
      departmentId ? parseInt(departmentId) : undefined,
      pageSection,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('gallery.view')
  findAllAdmin(
    @Query('includeDeleted') includeDeleted?: string,
    @Query('departmentId') departmentId?: string,
    @Query('mediaId') mediaId?: string,
    @Request() req?,
  ) {
    return this.galleryService.findAllAdmin(
      includeDeleted === 'true',
      departmentId ? parseInt(departmentId) : undefined,
      mediaId ? parseInt(mediaId) : undefined,
      req?.user,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('gallery.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateGalleryImageDto, @Request() req) {
    return this.galleryService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('gallery.update')
  reorder(@Body() dto: ReorderGalleryImagesDto, @Request() req) {
    return this.galleryService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('gallery.update')
  @DepartmentScoped({ source: 'lookup', model: 'galleryImage' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryImageDto,
    @Request() req,
  ) {
    return this.galleryService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('gallery.delete')
  @DepartmentScoped({ source: 'lookup', model: 'galleryImage' })
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.galleryService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('gallery.restore')
  @DepartmentScoped({ source: 'lookup', model: 'galleryImage' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.galleryService.restore(id, req.user, req.requestId);
  }
}
