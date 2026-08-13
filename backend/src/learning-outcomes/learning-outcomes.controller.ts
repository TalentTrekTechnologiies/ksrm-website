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
import { OutcomeType } from '@prisma/client';
import { LearningOutcomesService } from './learning-outcomes.service';
import { CreateLearningOutcomeDto } from './dto/create-learning-outcome.dto';
import { UpdateLearningOutcomeDto } from './dto/update-learning-outcome.dto';
import { ReorderLearningOutcomesDto } from './dto/reorder-learning-outcomes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';
import { DepartmentOwnershipGuard } from '../auth/department-ownership.guard';
import { DepartmentScoped } from '../auth/department-scope.decorator';

@ApiTags('learning-outcomes')
@Controller('learning-outcomes')
export class LearningOutcomesController {
  constructor(
    private readonly learningOutcomesService: LearningOutcomesService,
  ) {}

  @Get()
  findAllPublic(
    @Query('departmentId', ParseIntPipe) departmentId: number,
    @Query('type') type?: OutcomeType,
  ) {
    return this.learningOutcomesService.findAllPublic(departmentId, type);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('learning_outcomes.view')
  findAllAdmin(
    @Query('departmentId') departmentId?: string,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    return this.learningOutcomesService.findAllAdmin(
      departmentId ? parseInt(departmentId) : undefined,
      includeDeleted === 'true',
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('learning_outcomes.create')
  @DepartmentScoped({ source: 'body' })
  create(@Body() dto: CreateLearningOutcomeDto, @Request() req) {
    return this.learningOutcomesService.create(dto, req.user, req.requestId);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('learning_outcomes.update')
  reorder(@Body() dto: ReorderLearningOutcomesDto, @Request() req) {
    return this.learningOutcomesService.reorder(dto, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('learning_outcomes.update')
  @DepartmentScoped({ source: 'lookup', model: 'learningOutcome' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLearningOutcomeDto,
    @Request() req,
  ) {
    return this.learningOutcomesService.update(
      id,
      dto,
      req.user,
      req.requestId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('learning_outcomes.delete')
  @DepartmentScoped({ source: 'lookup', model: 'learningOutcome' })
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.learningOutcomesService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentOwnershipGuard)
  @RequirePermission('learning_outcomes.restore')
  @DepartmentScoped({ source: 'lookup', model: 'learningOutcome' })
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.learningOutcomesService.restore(id, req.user, req.requestId);
  }
}
