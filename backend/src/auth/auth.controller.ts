import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterAdminDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions.guard';
import { RequirePermission } from './permission.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('admins')
  register(@Body() registerAdminDto: RegisterAdminDto, @Request() req) {
    // Only super admin can register other admins
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException('Only super admins can register new admins');
    }
    return this.authService.registerAdmin(registerAdminDto);
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('admins')
  getAllAdmins() {
    return this.authService.getAllAdmins();
  }

  @Patch('admins/:id/permissions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('admins')
  updateAdminPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() { permissions }: { permissions: string[] },
  ) {
    return this.authService.updateAdminPermissions(id, permissions);
  }

  @Delete('admins/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('admins')
  deactivateAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.authService.deactivateAdmin(id);
  }
}
