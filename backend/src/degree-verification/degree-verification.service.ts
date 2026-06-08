import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDegreeVerificationDto,
  VerifyDegreeDto,
} from './dto/create-degree-verification.dto';

@Injectable()
export class DegreeVerificationService {
  constructor(private prisma: PrismaService) {}

  async verify(verifyDegreeDto: VerifyDegreeDto) {
    const record = await this.prisma.degreeVerification.findFirst({
      where: {
        hallTicketNo: verifyDegreeDto.hallTicketNo,
        studentName: verifyDegreeDto.studentName,
      },
    });

    if (!record) {
      throw new NotFoundException('Degree record not found');
    }

    return record;
  }

  async findAll() {
    return this.prisma.degreeVerification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createDegreeVerificationDto: CreateDegreeVerificationDto) {
    const existing = await this.prisma.degreeVerification.findUnique({
      where: { hallTicketNo: createDegreeVerificationDto.hallTicketNo },
    });

    if (existing) {
      throw new BadRequestException('Hall ticket number already exists');
    }

    return this.prisma.degreeVerification.create({
      data: createDegreeVerificationDto,
    });
  }
}
