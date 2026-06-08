import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamNotificationDto } from './dto/create-exam-notification.dto';

@Injectable()
export class ExamNotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where = {
      isActive: true,
      ...(category && { category }),
    };
    return this.prisma.examNotification.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async create(createExamNotificationDto: CreateExamNotificationDto) {
    return this.prisma.examNotification.create({
      data: {
        ...createExamNotificationDto,
        date: new Date(createExamNotificationDto.date),
      },
    });
  }

  async update(id: number, updateExamNotificationDto: CreateExamNotificationDto) {
    const notification = await this.prisma.examNotification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Exam notification with ID ${id} not found`);
    }
    return this.prisma.examNotification.update({
      where: { id },
      data: {
        ...updateExamNotificationDto,
        date: new Date(updateExamNotificationDto.date),
      },
    });
  }

  async delete(id: number) {
    const notification = await this.prisma.examNotification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Exam notification with ID ${id} not found`);
    }
    return this.prisma.examNotification.delete({
      where: { id },
    });
  }
}
