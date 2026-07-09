import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HeroService } from './hero.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';

@ApiTags('homepage-hero')
@Controller('homepage')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get('hero')
  getPublic() {
    return this.heroService.getPublic();
  }

  @Get('admin/hero')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  getAdmin() {
    return this.heroService.getAdmin();
  }

  @Post('admin/hero')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateHeroDto, @Request() req) {
    return this.heroService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/hero')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(@Body() dto: UpdateHeroDto, @Request() req) {
    return this.heroService.update(dto, req.user, req.requestId);
  }
}
