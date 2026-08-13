import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { EffectivePermissionsService } from '../effective-permissions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly effectivePermissions: EffectivePermissionsService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not set. Refusing to start with an insecure default signing key.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: number; email: string }) {
    // Re-fetch from the DB on every request (rather than trusting the JWT's
    // own claims) so a deactivated admin or a changed permission set takes
    // effect immediately instead of waiting out the token's 7-day lifetime.
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        permissions: true,
        department: true,
        departmentId: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!admin || !admin.isActive || admin.deletedAt) {
      throw new UnauthorizedException(
        'Account is inactive or no longer exists',
      );
    }

    // The legacy `admin.permissions` string array predates the Role/Permission
    // schema and is never populated for role-based grants - the real,
    // current permission set only exists via AdminRole -> Role ->
    // RolePermission. Resolve it here so every downstream guard check
    // reflects an admin's actual roles, not a stale/empty legacy column.
    const effectivePermissions =
      await this.effectivePermissions.getEffectivePermissions(admin);

    const {
      isActive,
      deletedAt,
      permissions: _legacyPermissions,
      ...rest
    } = admin;
    return { ...rest, permissions: Array.from(effectivePermissions) };
  }
}
