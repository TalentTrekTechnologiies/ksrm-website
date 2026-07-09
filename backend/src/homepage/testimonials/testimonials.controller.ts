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
import { TestimonialsService } from './testimonials.service';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { ReorderTestimonialsDto } from './dto/reorder-testimonials.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequirePermission } from '../../auth/permission.decorator';
import { SectionVisibilityService } from '../section-visibility/section-visibility.service';

@ApiTags('homepage-testimonials')
@Controller('homepage')
export class TestimonialsController {
  constructor(
    private readonly testimonialsService: TestimonialsService,
    private readonly sectionVisibility: SectionVisibilityService,
  ) {}

  @Get('testimonials')
  async findAllPublic() {
    const items = await this.testimonialsService.findAllPublic();
    return this.sectionVisibility.wrap('testimonials', items);
  }

  @Get('admin/testimonials')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.testimonialsService.findAllAdmin(includeDeleted === 'true');
  }

  @Post('admin/testimonials')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  create(@Body() dto: CreateTestimonialDto, @Request() req) {
    return this.testimonialsService.create(dto, req.user, req.requestId);
  }

  @Patch('admin/testimonials/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  reorder(@Body() dto: ReorderTestimonialsDto, @Request() req) {
    return this.testimonialsService.reorder(dto, req.user, req.requestId);
  }

  @Patch('admin/testimonials/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.edit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestimonialDto,
    @Request() req,
  ) {
    return this.testimonialsService.update(id, dto, req.user, req.requestId);
  }

  @Delete('admin/testimonials/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.testimonialsService.softDelete(id, req.user, req.requestId);
  }

  @Post('admin/testimonials/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('homepage.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.testimonialsService.restore(id, req.user, req.requestId);
  }
}
