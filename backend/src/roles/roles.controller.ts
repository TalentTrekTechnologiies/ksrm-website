import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('roles')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('roles')
  @RequirePermission('roles.view')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @RequirePermission('roles.view')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Post('roles')
  @RequirePermission('roles.create')
  create(@Body() dto: CreateRoleDto, @Request() req) {
    return this.rolesService.create(dto, req.user, req.requestId);
  }

  @Patch('roles/:id')
  @RequirePermission('roles.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @Request() req,
  ) {
    return this.rolesService.update(id, dto, req.user, req.requestId);
  }

  @Delete('roles/:id')
  @RequirePermission('roles.delete')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.rolesService.delete(id, req.user, req.requestId);
  }
}
