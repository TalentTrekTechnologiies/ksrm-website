import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(category?: string) {
    const where = {
      isActive: true,
      ...(category && { category }),
    };
    return this.prisma.galleryImage.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async create(createGalleryDto: CreateGalleryDto, admin: any) {
    const image = await this.prisma.galleryImage.create({
      data: {
        ...createGalleryDto,
        date: createGalleryDto.date ? new Date(createGalleryDto.date) : null,
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'gallery',
      targetId: image.id,
      details: { title: image.title, category: image.category },
    });

    return image;
  }

  async delete(id: number, admin: any) {
    const image = await this.prisma.galleryImage.findUnique({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Gallery image with ID ${id} not found`);
    }

    const deleted = await this.prisma.galleryImage.delete({
      where: { id },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'gallery',
      targetId: id,
      details: { title: image.title },
    });

    return deleted;
  }
}
