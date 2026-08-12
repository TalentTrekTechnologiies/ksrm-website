import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PageTablesService } from './page-tables.service';
import { CreatePageTableDto } from './dto/create-page-table.dto';
import { UpdatePageTableDto } from './dto/update-page-table.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { PageSectionOwnershipGuard } from '../auth/page-section-ownership.guard';
import { PageSectionScoped } from '../auth/page-section.decorator';

@ApiTags('page-tables')
@Controller('page-tables')
export class PageTablesController {
  constructor(private readonly service: PageTablesService) {}

  /** Public: the tables a page renders. */
  @Get()
  findAllPublic(@Query('pageSection') pageSection?: string) {
    return this.service.findAllPublic(pageSection);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('downloads.view')
  findAllAdmin(@Query('pageSection') pageSection?: string, @Request() req?) {
    return this.service.findAllAdmin(pageSection, req?.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, PageSectionOwnershipGuard)
  @RequirePermission('downloads.create')
  @PageSectionScoped({ source: 'body' })
  create(@Body() dto: CreatePageTableDto, @Request() req) {
    return this.service.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, PageSectionOwnershipGuard)
  @RequirePermission('downloads.update')
  @PageSectionScoped({ source: 'lookup', model: 'pageTable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePageTableDto, @Request() req) {
    return this.service.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, PageSectionOwnershipGuard)
  @RequirePermission('downloads.delete')
  @PageSectionScoped({ source: 'lookup', model: 'pageTable' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.remove(id, req.user, req.requestId);
  }
}
