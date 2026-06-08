import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlacementDto } from './dto/create-placement.dto';

@Injectable()
export class PlacementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(year?: number) {
    const where = year ? { year } : {};
    return this.prisma.placement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const placements = await this.prisma.placement.findMany();
    const uniqueCompanies = new Set(placements.map(p => p.company)).size;

    return {
      totalPlacements: placements.length,
      uniqueCompanies,
      byDepartment: placements.reduce((acc, p) => {
        acc[p.department] = (acc[p.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byYear: placements.reduce((acc, p) => {
        acc[p.year] = (acc[p.year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };
  }

  async create(createPlacementDto: CreatePlacementDto) {
    return this.prisma.placement.create({
      data: createPlacementDto,
    });
  }

  async delete(id: number) {
    const placement = await this.prisma.placement.findUnique({
      where: { id },
    });
    if (!placement) {
      throw new NotFoundException(`Placement with ID ${id} not found`);
    }
    return this.prisma.placement.delete({
      where: { id },
    });
  }
}
