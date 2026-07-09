import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SectionVisibilityService } from './section-visibility.service';
import { UpdateSectionVisibilityDto } from './dto/update-section-visibility.dto';
import type { SectionVisibilityKey } from './section-visibility.constants';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';

@ApiTags('homepage-section-visibility')
@Controller('homepage/admin/section-visibility')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SectionVisibilityController {
  constructor(
    private readonly sectionVisibilityService: SectionVisibilityService,
  ) {}

  @Get()
  @RequirePermission('homepage.view')
  getAll() {
    return this.sectionVisibilityService.getAll();
  }

  @Patch(':key')
  @RequirePermission('homepage.edit')
  update(
    @Param('key') key: SectionVisibilityKey,
    @Body() dto: UpdateSectionVisibilityDto,
    @Request() req,
  ) {
    return this.sectionVisibilityService.update(
      key,
      dto.visible,
      req.user,
      req.requestId,
    );
  }
}
