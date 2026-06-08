import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { DegreeVerificationService } from './degree-verification.service';
import {
  CreateDegreeVerificationDto,
  VerifyDegreeDto,
} from './dto/create-degree-verification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permission.decorator';

@Controller('degree-verification')
export class DegreeVerificationController {
  constructor(private readonly degreeVerificationService: DegreeVerificationService) {}

  @Post('verify')
  verify(@Body() verifyDegreeDto: VerifyDegreeDto) {
    return this.degreeVerificationService.verify(verifyDegreeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('degree_verification')
  findAll() {
    return this.degreeVerificationService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('degree_verification')
  create(@Body() createDegreeVerificationDto: CreateDegreeVerificationDto) {
    return this.degreeVerificationService.create(createDegreeVerificationDto);
  }
}
