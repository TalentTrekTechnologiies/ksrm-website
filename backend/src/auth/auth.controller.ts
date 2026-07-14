import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

// Admin-account CRUD (create/list/edit/delete/restore/reset-password/
// role-assignment) lives in AdminsModule (`/admins`), not here - this
// controller is deliberately just the two routes every admin needs
// regardless of what they're permitted to manage: log in, and read their
// own profile.
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Much tighter than the global limit - login is the brute-force surface.
  // 10 attempts/minute per IP is generous for humans and useless for
  // credential stuffing.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
