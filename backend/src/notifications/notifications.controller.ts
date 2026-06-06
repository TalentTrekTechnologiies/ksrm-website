import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // Public — used by the header ticker
  @Get()
  findActive() {
    return this.service.findActive();
  }

  // Admin — all notifications regardless of active state
  @Get('admin')
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body('text') text: string) {
    return this.service.create(text);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.service.toggle(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.service.remove(id);
    return { success: ok };
  }
}
