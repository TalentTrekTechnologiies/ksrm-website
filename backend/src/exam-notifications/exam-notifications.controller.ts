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
} from '@nestjs/common';
import { ExamNotificationsService } from './exam-notifications.service';
import { CreateExamNotificationDto } from './dto/create-exam-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('exam-notifications')
export class ExamNotificationsController {
  constructor(private readonly examNotificationsService: ExamNotificationsService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    return this.examNotificationsService.findAll(category);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('exam')
  create(@Body() createExamNotificationDto: CreateExamNotificationDto) {
    return this.examNotificationsService.create(createExamNotificationDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('exam')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExamNotificationDto: CreateExamNotificationDto,
  ) {
    return this.examNotificationsService.update(id, updateExamNotificationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('exam')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.examNotificationsService.delete(id);
  }
}
