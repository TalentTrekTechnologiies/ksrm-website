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
import { CareersService } from './careers.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';
import { ReorderCareersDto } from './dto/reorder-careers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  findAllPublic() {
    return this.careersService.findAllPublic();
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.careersService.findAllAdmin(includeDeleted === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers.create')
  create(@Body() dto: CreateCareerDto, @Request() req) {
    return this.careersService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers.update')
  reorder(@Body() dto: ReorderCareersDto, @Request() req) {
    return this.careersService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCareerDto,
    @Request() req,
  ) {
    return this.careersService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.careersService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('careers.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.careersService.restore(id, req.user, req.requestId);
  }
}
