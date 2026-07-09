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
import { CampusVideosService } from './campus-videos.service';
import { CreateCampusVideoDto } from './dto/create-campus-video.dto';
import { UpdateCampusVideoDto } from './dto/update-campus-video.dto';
import { ReorderCampusVideosDto } from './dto/reorder-campus-videos.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';
import { SectionVisibilityService } from '../section-visibility/section-visibility.service';

@ApiTags('homepage-campus-videos')
@Controller('homepage')
export class CampusVideosController {
  constructor(
    private readonly campusVideosService: CampusVideosService,
    private readonly sectionVisibility: SectionVisibilityService,
  ) {}

  @Get('campus-videos')
  async findAllPublic() {
    const items = await this.campusVideosService.findAllPublic();
    return this.sectionVisibility.wrap('campusVideos', items);
  }

  @Get('admin/campus-videos')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.campusVideosService.findAllAdmin(includeDeleted === 'true');
  }

  @Post('admin/campus-videos')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateCampusVideoDto, @Request() req) {
    return this.campusVideosService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/campus-videos/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderCampusVideosDto, @Request() req) {
    return this.campusVideosService.reorder(dto, req.user, req.requestId);
  }

  @Patch('admin/campus-videos/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampusVideoDto,
    @Request() req,
  ) {
    return this.campusVideosService.update(id, dto, req.user, req.requestId);
  }

  @Delete('admin/campus-videos/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.campusVideosService.softDelete(id, req.user, req.requestId);
  }

  @Post('admin/campus-videos/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.campusVideosService.restore(id, req.user, req.requestId);
  }
}
