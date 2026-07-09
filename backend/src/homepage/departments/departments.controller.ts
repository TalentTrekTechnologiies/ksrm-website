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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentCardDto } from './dto/create-department-card.dto';
import type { DepartmentCardSection } from './dto/create-department-card.dto';
import { UpdateDepartmentCardDto } from './dto/update-department-card.dto';
import { ReorderDepartmentCardsDto } from './dto/reorder-department-cards.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';
import { SectionVisibilityService } from '../section-visibility/section-visibility.service';

@ApiTags('homepage-departments')
@Controller('homepage')
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly sectionVisibility: SectionVisibilityService,
  ) {}

  @Get('departments')
  async findAllPublic(@Query('section') section: DepartmentCardSection) {
    const items = await this.departmentsService.findAllPublic(section);
    return this.sectionVisibility.wrap('departments', items);
  }

  @Get('admin/departments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(
    @Query('section') section?: DepartmentCardSection,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.departmentsService.findAllAdmin(
      section,
      includeDeleted === 'true',
    );
  }

  @Post('admin/departments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateDepartmentCardDto, @Request() req) {
    return this.departmentsService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/departments/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderDepartmentCardsDto, @Request() req) {
    return this.departmentsService.reorder(dto, req.user, req.requestId);
  }

  @Patch('admin/departments/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentCardDto,
    @Request() req,
  ) {
    return this.departmentsService.update(id, dto, req.user, req.requestId);
  }

  @Delete('admin/departments/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentsService.softDelete(id, req.user, req.requestId);
  }

  @Post('admin/departments/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.departmentsService.restore(id, req.user, req.requestId);
  }
}
