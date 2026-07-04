import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('placements')
@Controller('placements')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Get()
  findAll(@Query('year') year?: string) {
    return this.placementsService.findAll(year ? parseInt(year) : undefined);
  }

  @Get('stats')
  getStats() {
    return this.placementsService.getStats();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('placements')
  create(@Body() createPlacementDto: CreatePlacementDto) {
    return this.placementsService.create(createPlacementDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('placements')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.placementsService.delete(id);
  }
}
