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
import { CommitteeType, CommitteePlacement } from '@prisma/client';
import { CommitteesService } from './committees.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { CreateCommitteeMemberDto } from './dto/create-committee-member.dto';
import { UpdateCommitteeMemberDto } from './dto/update-committee-member.dto';
import { ReorderCommitteesDto } from './dto/reorder-committees.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('committees')
@Controller('committees')
export class CommitteesController {
  constructor(private readonly committeesService: CommitteesService) {}

  @Get()
  findAllPublic(
    @Query('type') type?: CommitteeType,
    @Query('placement') placement?: CommitteePlacement,
  ) {
    return this.committeesService.findAllPublic(type, placement);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.view')
  findAllAdmin(@Query('includeDeleted') includeDeleted?: string) {
    return this.committeesService.findAllAdmin(includeDeleted === 'true');
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.create')
  create(@Body() dto: CreateCommitteeDto, @Request() req) {
    return this.committeesService.create(dto, req.user, req.requestId);
  }

  // Declared above the ':id' routes on purpose - Nest matches in order, so
  // 'reorder' would otherwise be swallowed by ':id' and fail to parse as an int.
  @Post('reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.update')
  reorder(@Body() dto: ReorderCommitteesDto, @Request() req) {
    return this.committeesService.reorder(dto.ids, req.user, req.requestId);
  }

  @Post(':committeeId/members/reorder')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.update')
  reorderMembers(
    @Param('committeeId', ParseIntPipe) committeeId: number,
    @Body() dto: ReorderCommitteesDto,
    @Request() req,
  ) {
    return this.committeesService.reorderMembers(committeeId, dto.ids, req.user, req.requestId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommitteeDto, @Request() req) {
    return this.committeesService.update(id, dto, req.user, req.requestId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.delete')
  softDelete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.committeesService.softDelete(id, req.user, req.requestId);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.restore')
  restore(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.committeesService.restore(id, req.user, req.requestId);
  }

  // --- Members ---

  @Post(':committeeId/members')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.create')
  createMember(
    @Param('committeeId', ParseIntPipe) committeeId: number,
    @Body() dto: CreateCommitteeMemberDto,
    @Request() req,
  ) {
    return this.committeesService.createMember(committeeId, dto, req.user, req.requestId);
  }

  @Patch('members/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.update')
  updateMember(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommitteeMemberDto,
    @Request() req,
  ) {
    return this.committeesService.updateMember(id, dto, req.user, req.requestId);
  }

  @Delete('members/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.delete')
  softDeleteMember(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.committeesService.softDeleteMember(id, req.user, req.requestId);
  }

  @Post('members/:id/restore')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('committees.restore')
  restoreMember(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.committeesService.restoreMember(id, req.user, req.requestId);
  }
}
