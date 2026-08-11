import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExamNotificationType } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { ExamNotificationsService } from './exam-notifications.service';
import { CreateExamNotificationDto } from './dto/create-exam-notification.dto';
import { UpdateExamNotificationDto } from './dto/update-exam-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('exam-notifications')
@Controller('exam-notifications')
export class ExamNotificationsController {
  constructor(private readonly examNotificationsService: ExamNotificationsService) {}

  @Get()
  findAllPublic(@Query('type') type?: ExamNotificationType) {
    return this.examNotificationsService.findAllPublic(type);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('exam_notifications.view')
  findAllAdmin(@Query('type') type?: ExamNotificationType) {
    return this.examNotificationsService.findAllAdmin(type);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('exam_notifications.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateExamNotificationDto, @Request() req) {
    return this.examNotificationsService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('exam_notifications.update')
  @DepartmentScoped({ source: 'lookup', model: 'examNotification' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExamNotificationDto,
    @Request() req,
  ) {
    return this.examNotificationsService.update(id, dto, req.user, req.requestId);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('exam_notifications.update')
  @DepartmentScoped({ source: 'lookup', model: 'examNotification' })
  publish(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.examNotificationsService.setPublished(id, true, req.user, req.requestId);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('exam_notifications.update')
  @DepartmentScoped({ source: 'lookup', model: 'examNotification' })
  unpublish(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.examNotificationsService.setPublished(id, false, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('exam_notifications.delete')
  @DepartmentScoped({ source: 'lookup', model: 'examNotification' })
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.examNotificationsService.delete(id, req.user, req.requestId);
  }
}
