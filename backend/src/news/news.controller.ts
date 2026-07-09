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
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { SectionVisibilityService } from '../homepage/section-visibility/section-visibility.service';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly sectionVisibility: SectionVisibilityService,
  ) {}

  // Note: this wraps the response as { visible, items } only when consumed
  // by the homepage's Latest News teaser (via lib/news-api.ts's
  // getLatestNewsForHomepage()) - the full /news listing page (if/when
  // built) should call this same route and just always render `items`
  // regardless of `visible`, since `homepage.visibility.latestNews` only
  // controls the homepage teaser, not the standalone /news page.
  @Get()
  async findAllPublic(@Query('category') category?: string) {
    const items = await this.newsService.findAllPublic(category);
    return this.sectionVisibility.wrap('latestNews', items);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.newsService.findAllAdmin(includeDeleted === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.newsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.create')
  create(@Body() dto: CreateNewsDto, @Request() req) {
    return this.newsService.create(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNewsDto,
    @Request() req,
  ) {
    return this.newsService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.delete')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.newsService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('news.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.newsService.restore(id, req.user, req.requestId);
  }
}
