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
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@ApiTags('faculty')
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  findAll(@Query('department') department?: string) {
    return this.facultyService.findAll(department);
  }

  @Get('hod/:department')
  findHod(@Param('department') department: string) {
    return this.facultyService.findHodByDepartment(department);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facultyService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty')
  create(@Body() createFacultyDto: CreateFacultyDto, @Request() req) {
    return this.facultyService.create(createFacultyDto, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacultyDto: CreateFacultyDto,
    @Request() req,
  ) {
    return this.facultyService.update(id, updateFacultyDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('faculty')
  delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.facultyService.delete(id, req.user);
  }
}
