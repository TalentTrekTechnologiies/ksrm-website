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
import { AccreditationBadgesService } from './accreditation-badges.service';
import { CreateAccreditationBadgeDto } from './dto/create-accreditation-badge.dto';
import { UpdateAccreditationBadgeDto } from './dto/update-accreditation-badge.dto';
import { ReorderAccreditationBadgesDto } from './dto/reorder-accreditation-badges.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';
import { SectionVisibilityService } from '../section-visibility/section-visibility.service';

@ApiTags('homepage-accreditation-badges')
@Controller('homepage')
export class AccreditationBadgesController {
  constructor(
    private readonly accreditationBadgesService: AccreditationBadgesService,
    private readonly sectionVisibility: SectionVisibilityService,
  ) {}

  @Get('accreditation-badges')
  async findAllPublic() {
    const items = await this.accreditationBadgesService.findAllPublic();
    return this.sectionVisibility.wrap('accreditation', items);
  }

  @Get('admin/accreditation-badges')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.accreditationBadgesService.findAllAdmin(
      includeDeleted === 'true',
    );
  }

  @Post('admin/accreditation-badges')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateAccreditationBadgeDto, @Request() req) {
    return this.accreditationBadgesService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/accreditation-badges/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderAccreditationBadgesDto, @Request() req) {
    return this.accreditationBadgesService.reorder(
      dto,
      req.user,
      req.requestId,
    );
  }

  @Patch('admin/accreditation-badges/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAccreditationBadgeDto,
    @Request() req,
  ) {
    return this.accreditationBadgesService.update(
      id,
      dto,
      req.user,
      req.requestId,
    );
  }

  @Delete('admin/accreditation-badges/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.accreditationBadgesService.softDelete(
      id,
      req.user,
      req.requestId,
    );
  }

  @Post('admin/accreditation-badges/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.accreditationBadgesService.restore(id, req.user, req.requestId);
  }
}
