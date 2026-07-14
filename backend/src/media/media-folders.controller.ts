import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
  create(@Body() dto: CreateMediaFolderDto) {
    return this.foldersService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('media.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMediaFolderDto,
  ) {
    return this.foldersService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('media.delete')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.foldersService.delete(id);
  }
}
