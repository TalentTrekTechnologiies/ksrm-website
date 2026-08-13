import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminNotificationsService } from './admin-notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Deliberately no PermissionsGuard here - every route is scoped to
// req.user.id (the caller's own notifications), not gated by a module
// permission, the same way a user's own inbox needs no extra grant.
@ApiTags('admin-notifications')
@Controller('admin-notifications')
@UseGuards(JwtAuthGuard)
export class AdminNotificationsController {
  constructor(private readonly service: AdminNotificationsService) {}

  @Get()
  async findForAdmin(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findForAdmin(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    return this.service.getUnreadCount(req.user.id);
  }

  @Post(':id/read')
  async markRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.markRead(id, req.user.id);
  }

  @Post('read-all')
  async markAllRead(@Request() req) {
    return this.service.markAllRead(req.user.id);
  }
}
