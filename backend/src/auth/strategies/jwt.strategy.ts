import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
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
        isActive: true,
      },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }

    const { isActive, ...user } = admin;
    return user;
  }
}
