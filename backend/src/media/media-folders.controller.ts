import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MediaFoldersService } from './media-folders.service';
import { CreateMediaFolderDto } from './dto/create-media-folder.dto';
import { UpdateMediaFolderDto } from './dto/update-media-folder.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('media-folders')
@Controller('media/folders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MediaFoldersController {
  constructor(private readonly foldersService: MediaFoldersService) {}

  @Get()
  @RequirePermission('media.view')
  findAll() {
    return this.foldersService.findAll();
  }

  @Post()
  @RequirePermission('media.create')
  create(@Body() dto: CreateMediaFolderDto, @Request() req) {
    return this.foldersService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @RequirePermission('media.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaFolderDto,
    @Request() req,
  ) {
    return this.foldersService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @RequirePermission('media.delete')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.foldersService.delete(id, req.user, req.requestId);
  }
}
