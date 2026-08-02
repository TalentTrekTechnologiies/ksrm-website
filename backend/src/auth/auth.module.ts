import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TOKEN_LIFETIME } from './token-lifetime';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EffectivePermissionsService } from './effective-permissions.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET is not set. Refusing to start with an insecure default signing key.',
          );
        }
        return {
          secret,
          signOptions: { expiresIn: TOKEN_LIFETIME },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EffectivePermissionsService],
  exports: [EffectivePermissionsService],
})
export class AuthModule {}
