import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(category?: string) {
    const where = {
      isPublished: true,
      ...(category && { category }),
    };
    return this.prisma.news.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const news = await this.prisma.news.findUnique({
      where: { id },
    });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async create(createNewsDto: CreateNewsDto, admin: any) {
    const newNews = await this.prisma.news.create({
      data: {
        ...createNewsDto,
        date: new Date(createNewsDto.date),
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'news',
      targetId: newNews.id,
      details: { title: newNews.title, category: newNews.category },
    });

    return newNews;
  }

  async update(id: number, updateNewsDto: CreateNewsDto, admin: any) {
    const news = await this.findOne(id);
    const updated = await this.prisma.news.update({
      where: { id },
      data: {
        ...updateNewsDto,
        date: new Date(updateNewsDto.date),
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'news',
      targetId: id,
      details: { title: updated.title, changedFields: Object.keys(updateNewsDto) },
    });

    return updated;
  }

  async delete(id: number, admin: any) {
    const news = await this.findOne(id);
    const deleted = await this.prisma.news.delete({
      where: { id },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'news',
      targetId: id,
      details: { title: news.title },
    });

    return deleted;
  }
}
