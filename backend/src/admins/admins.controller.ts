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
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { QueryAdminsDto } from './dto/query-admins.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('admins')
@Controller('admins')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  @RequirePermission('admins.view')
  findAll(@Query() query: QueryAdminsDto) {
    return this.adminsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('admins.view')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.findOne(id);
  }

  @Post()
  @RequirePermission('admins.create')
  create(@Body() dto: CreateAdminDto, @Request() req) {
    return this.adminsService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @RequirePermission('admins.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminDto,
    @Request() req,
  ) {
    return this.adminsService.update(id, dto, req.user, req.requestId);
  }

  @Patch(':id/status')
  @RequirePermission('admins.update')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() { isActive }: { isActive: boolean },
    @Request() req,
  ) {
    return this.adminsService.setStatus(id, isActive, req.user, req.requestId);
  }

  @Post(':id/reset-password')
  @RequirePermission('admins.update')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
    @Request() req,
  ) {
    return this.adminsService.resetPassword(id, dto, req.user, req.requestId);
  }

  @Patch(':id/roles')
  @RequirePermission('admins.update')
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolesDto,
    @Request() req,
  ) {
    return this.adminsService.assignRoles(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @RequirePermission('admins.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @RequirePermission('admins.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminsService.restore(id, req.user, req.requestId);
  }
}
