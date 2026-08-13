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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KgcetService } from './kgcet.service';
import {
  CreateKgcetParticipationDto,
  UpdateKgcetParticipationDto,
  CreateKgcetHighlightDto,
  UpdateKgcetHighlightDto,
  ReorderKgcetDto,
} from './dto/kgcet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

/**
 * KGCET's own screen, rather than sixty text boxes in Page Content.
 *
 * One controller for both resources, addressed as /kgcet/participation and
 * /kgcet/highlights, so the module reads as one thing in the admin and in the
 * permission list.
 */
type Resource = 'participation' | 'highlights';

const RESOURCES: Resource[] = ['participation', 'highlights'];

function assertResource(value: string): Resource {
  if (!RESOURCES.includes(value as Resource)) {
    throw new BadRequestException(
      `Unknown KGCET resource '${value}'. Expected one of: ${RESOURCES.join(', ')}`,
    );
  }
  return value as Resource;
}

@ApiTags('kgcet')
@Controller('kgcet')
export class KgcetController {
  constructor(private readonly service: KgcetService) {}

  // Declared before ':resource/:id' - Nest matches in order, so 'reorder'
  // would otherwise be swallowed by ':id' and fail to parse as an int.
  @Post(':resource/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('kgcet.update')
  reorder(
    @Param('resource') resource: string,
    @Body() dto: ReorderKgcetDto,
    @Request() req,
  ) {
    return this.service.reorder(
      assertResource(resource),
      dto,
      req.user,
      req.requestId,
    );
  }

  @Get(':resource')
  findAllPublic(@Param('resource') resource: string) {
    return this.service.findAllPublic(assertResource(resource));
  }

  @Get(':resource/admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('kgcet.view')
  findAllAdmin(
    @Param('resource') resource: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.service.findAllAdmin(
      assertResource(resource),
      includeDeleted === 'true',
    );
  }

  @Post(':resource')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('kgcet.create')
  create(
    @Param('resource') resource: string,
    @Body() dto: CreateKgcetParticipationDto & CreateKgcetHighlightDto,
    @Request() req,
  ) {
    return this.service.create(
      assertResource(resource),
      dto,
      req.user,
      req.requestId,
    );
  }

  @Patch(':resource/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('kgcet.update')
  update(
    @Param('resource') resource: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKgcetParticipationDto & UpdateKgcetHighlightDto,
    @Request() req,
  ) {
    return this.service.update(
      assertResource(resource),
      id,
      dto,
      req.user,
      req.requestId,
    );
  }

  @Delete(':resource/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('kgcet.delete')
  remove(
    @Param('resource') resource: string,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.service.remove(
      assertResource(resource),
      id,
      req.user,
      req.requestId,
    );
  }

  @Post(':resource/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('kgcet.restore')
  restore(
    @Param('resource') resource: string,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.service.restore(
      assertResource(resource),
      id,
      req.user,
      req.requestId,
    );
  }
}
