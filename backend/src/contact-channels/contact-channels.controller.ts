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
import { ContactChannelsService } from './contact-channels.service';
import { CreateContactChannelDto } from './dto/create-contact-channel.dto';
import { UpdateContactChannelDto } from './dto/update-contact-channel.dto';
import { ReorderContactChannelsDto } from './dto/reorder-contact-channels.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('contact-channels')
@Controller('contact-channels')
export class ContactChannelsController {
  constructor(private readonly contactChannelsService: ContactChannelsService) {}

  // No departmentId -> the global office directory (Principal/Admissions/
  // Exam/Placement/Main). departmentId set -> that department's Contact tab.
  @Get()
  findAllPublic(@Query('departmentId') departmentId?: string) {
    return this.contactChannelsService.findAllPublic(
      departmentId ? parseInt(departmentId) : null,
    );
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contact.view')
  findAllAdmin(
    @Query('departmentId') departmentId?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.contactChannelsService.findAllAdmin(
      departmentId ? parseInt(departmentId) : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('contact.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateContactChannelDto, @Request() req) {
    return this.contactChannelsService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('contact.update')
  reorder(@Body() dto: ReorderContactChannelsDto, @Request() req) {
    return this.contactChannelsService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('contact.update')
  @DepartmentScoped({ source: 'lookup', model: 'contactChannel' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactChannelDto,
    @Request() req,
  ) {
    return this.contactChannelsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('contact.delete')
  @DepartmentScoped({ source: 'lookup', model: 'contactChannel' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.contactChannelsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('contact.restore')
  @DepartmentScoped({ source: 'lookup', model: 'contactChannel' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.contactChannelsService.restore(id, req.user, req.requestId);
  }
}
