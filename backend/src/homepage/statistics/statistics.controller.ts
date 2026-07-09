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
import { StatisticsService } from './statistics.service';
import { CreateStatisticDto } from './dto/create-statistic.dto';
import type { StatisticGroup } from './dto/create-statistic.dto';
import { UpdateStatisticDto } from './dto/update-statistic.dto';
import { ReorderStatisticsDto } from './dto/reorder-statistics.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';

@ApiTags('homepage-statistics')
@Controller('homepage')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('statistics')
  findAllPublic(@Query('group') group: StatisticGroup) {
    return this.statisticsService.findAllPublic(group);
  }

  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(
    @Query('group') group?: StatisticGroup,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.statisticsService.findAllAdmin(group, includeDeleted === 'true');
  }

  @Post('admin/statistics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateStatisticDto, @Request() req) {
    return this.statisticsService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/statistics/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderStatisticsDto, @Request() req) {
    return this.statisticsService.reorder(dto, req.user, req.requestId);
  }

  @Patch('admin/statistics/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatisticDto,
    @Request() req,
  ) {
    return this.statisticsService.update(id, dto, req.user, req.requestId);
  }

  @Delete('admin/statistics/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.statisticsService.softDelete(id, req.user, req.requestId);
  }

  @Post('admin/statistics/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.statisticsService.restore(id, req.user, req.requestId);
  }
}
