import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { EffectivePermissionsService } from './effective-permissions.service';
import * as bcrypt from 'bcrypt';
import { TOKEN_LIFETIME } from './token-lifetime';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private effectivePermissions: EffectivePermissionsService,
  ) {}

  async login(loginDto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: loginDto.email },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Fire-and-forget: a slow/failed lastLoginAt write shouldn't ever block
    // or fail an otherwise-successful login.
    this.prisma.admin
      .update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })
      .catch(() => undefined);

    // Role-resolved permissions, not the legacy admin.permissions column -
    // see JwtStrategy.validate() for why. The frontend uses this response's
    // `admin.permissions` for sidebar visibility immediately after login,
    // before any subsequent request would otherwise re-resolve it.
    const permissions = Array.from(
      await this.effectivePermissions.getEffectivePermissions(admin),
    );

    const token = this.jwtService.sign(
      {
        sub: admin.id,
        email: admin.email,
        name: admin.name,
        isSuperAdmin: admin.isSuperAdmin,
        permissions,
        department: admin.department,
      },
      { expiresIn: TOKEN_LIFETIME },
    );

    return {
      accessToken: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
        permissions,
      },
    };
  }

  async getProfile(adminId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        department: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    const permissions = Array.from(
      await this.effectivePermissions.getEffectivePermissions(admin),
    );

    return { ...admin, permissions };
  }
}
