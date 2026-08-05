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
import { TransportRoutesService } from './transport-routes.service';
import {
  CreateTransportRouteDto,
  UpdateTransportRouteDto,
  ReorderTransportRoutesDto,
} from './dto/transport-route.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('transport-routes')
@Controller('transport-routes')
export class TransportRoutesController {
  constructor(private readonly service: TransportRoutesService) {}

  @Get()
  findAllPublic() {
    return this.service.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('transport_routes.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.service.findAllAdmin(includeDeleted === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('transport_routes.create')
  create(@Body() dto: CreateTransportRouteDto, @Request() req) {
    return this.service.create(dto, req.user, req.requestId);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('transport_routes.update')
  reorder(@Body() dto: ReorderTransportRoutesDto, @Request() req) {
    return this.service.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('transport_routes.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTransportRouteDto,
    @Request() req,
  ) {
    return this.service.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('transport_routes.delete')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.remove(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('transport_routes.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.restore(id, req.user, req.requestId);
  }
}
