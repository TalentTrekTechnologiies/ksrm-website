import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    const token = this.jwtService.sign(
      {
        sub: admin.id,
        email: admin.email,
        name: admin.name,
        isSuperAdmin: admin.isSuperAdmin,
        permissions: admin.permissions,
        department: admin.department,
      },
      { expiresIn: '7d' },
    );

    return {
      accessToken: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isSuperAdmin: admin.isSuperAdmin,
        permissions: admin.permissions,
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
        permissions: true,
        department: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return admin;
  }

  async registerAdmin(registerData: {
    email: string;
    password: string;
    name: string;
    permissions: string[];
    department?: string;
  }) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: registerData.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    return this.prisma.admin.create({
      data: {
        email: registerData.email,
        password: hashedPassword,
        name: registerData.name,
        permissions: registerData.permissions,
        department: registerData.department,
        isSuperAdmin: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        department: true,
      },
    });
  }

  async getAllAdmins() {
    return this.prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        permissions: true,
        department: true,
        isActive: true,
      },
    });
  }

  async updateAdminPermissions(
    adminId: number,
    permissions: string[],
  ) {
    return this.prisma.admin.update({
      where: { id: adminId },
      data: { permissions },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
      },
    });
  }

  async deactivateAdmin(adminId: number) {
    return this.prisma.admin.update({
      where: { id: adminId },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }
}
