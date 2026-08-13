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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ReorderEventsDto } from './dto/reorder-events.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAllPublic(@Query('departmentId') departmentId?: string) {
    const deptId = departmentId ? Number(departmentId) : undefined;
    return this.eventsService.findAllPublic(
      Number.isFinite(deptId) ? deptId : undefined,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('events.view')
  findAllAdmin(
    @Query('includeDeleted') includeDeleted?: string,
    @Query('departmentId') departmentId?: string,
    @Request() req?,
  ) {
    const deptId = departmentId ? Number(departmentId) : undefined;
    return this.eventsService.findAllAdmin(
      includeDeleted === 'true',
      Number.isFinite(deptId) ? deptId : undefined,
      req?.user,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('events.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateEventDto, @Request() req) {
    return this.eventsService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('events.update')
  reorder(@Body() dto: ReorderEventsDto, @Request() req) {
    return this.eventsService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('events.update')
  @DepartmentScoped({ source: 'lookup', model: 'event' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @Request() req,
  ) {
    return this.eventsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('events.delete')
  @DepartmentScoped({ source: 'lookup', model: 'event' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('events.restore')
  @DepartmentScoped({ source: 'lookup', model: 'event' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.eventsService.restore(id, req.user, req.requestId);
  }
}
