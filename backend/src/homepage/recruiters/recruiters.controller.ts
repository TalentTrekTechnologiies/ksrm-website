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
import { RecruitersService } from './recruiters.service';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { ReorderRecruitersDto } from './dto/reorder-recruiters.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';
import { SectionVisibilityService } from '../section-visibility/section-visibility.service';

@ApiTags('homepage-recruiters')
@Controller('homepage')
export class RecruitersController {
  constructor(
    private readonly recruitersService: RecruitersService,
    private readonly sectionVisibility: SectionVisibilityService,
  ) {}

  @Get('recruiters')
  async findAllPublic() {
    const items = await this.recruitersService.findAllPublic();
    return this.sectionVisibility.wrap('recruiters', items);
  }

  @Get('admin/recruiters')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.recruitersService.findAllAdmin(includeDeleted === 'true');
  }

  @Post('admin/recruiters')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateRecruiterDto, @Request() req) {
    return this.recruitersService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/recruiters/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderRecruitersDto, @Request() req) {
    return this.recruitersService.reorder(dto, req.user, req.requestId);
  }

  @Patch('admin/recruiters/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecruiterDto,
    @Request() req,
  ) {
    return this.recruitersService.update(id, dto, req.user, req.requestId);
  }

  @Delete('admin/recruiters/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.recruitersService.softDelete(id, req.user, req.requestId);
  }

  @Post('admin/recruiters/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.recruitersService.restore(id, req.user, req.requestId);
  }
}
