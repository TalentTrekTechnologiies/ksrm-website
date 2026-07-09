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
import { QuickLinksService } from './quick-links.service';
import { CreateQuickLinkDto } from './dto/create-quick-link.dto';
import type { QuickLinkSection } from './dto/create-quick-link.dto';
import { UpdateQuickLinkDto } from './dto/update-quick-link.dto';
import { ReorderQuickLinksDto } from './dto/reorder-quick-links.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';

@ApiTags('homepage-quick-links')
@Controller('homepage')
export class QuickLinksController {
  constructor(private readonly quickLinksService: QuickLinksService) {}

  @Get('quick-links')
  findAllPublic(@Query('section') section: QuickLinkSection) {
    return this.quickLinksService.findAllPublic(section);
  }

  @Get('admin/quick-links')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(
    @Query('section') section?: QuickLinkSection,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.quickLinksService.findAllAdmin(section, includeDeleted === 'true');
  }

  @Post('admin/quick-links')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateQuickLinkDto, @Request() req) {
    return this.quickLinksService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/quick-links/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderQuickLinksDto, @Request() req) {
    return this.quickLinksService.reorder(dto, req.user, req.requestId);
  }

  @Patch('admin/quick-links/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuickLinkDto,
    @Request() req,
  ) {
    return this.quickLinksService.update(id, dto, req.user, req.requestId);
  }

  @Delete('admin/quick-links/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.quickLinksService.softDelete(id, req.user, req.requestId);
  }

  @Post('admin/quick-links/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.quickLinksService.restore(id, req.user, req.requestId);
  }
}
