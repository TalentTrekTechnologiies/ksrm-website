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
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('placements')
@Controller('placements')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Get()
  findAll(@Query('year') year?: string) {
    return this.placementsService.findAll(year ? parseInt(year) : undefined);
  }

  @Get('stats')
  getStats() {
    return this.placementsService.getStats();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('placements.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.placementsService.findAllAdmin(includeDeleted === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('placements.create')
  create(@Body() dto: CreatePlacementDto, @Request() req) {
    return this.placementsService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('placements.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlacementDto,
    @Request() req,
  ) {
    return this.placementsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('placements.delete')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.placementsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('placements.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.placementsService.restore(id, req.user, req.requestId);
  }
}
