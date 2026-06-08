import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';

@Injectable()
export class FacultyService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(department?: string) {
    const where = department ? { department } : {};
    return this.prisma.faculty.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
    });
    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }
    return faculty;
  }

  async findHodByDepartment(department: string) {
    const hod = await this.prisma.faculty.findFirst({
      where: {
        department,
        isHod: true,
        isActive: true,
      },
    });
    if (!hod) {
      throw new NotFoundException(`HOD for ${department} not found`);
    }
    return hod;
  }

  async create(createFacultyDto: CreateFacultyDto, admin: any) {
    const newFaculty = await this.prisma.faculty.create({
      data: createFacultyDto,
    });

    // Log the action
    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'faculty',
      targetId: newFaculty.id,
      details: { name: newFaculty.name, department: newFaculty.department },
    });

    return newFaculty;
  }

  async update(id: number, updateFacultyDto: CreateFacultyDto, admin: any) {
    const faculty = await this.findOne(id);
    const updated = await this.prisma.faculty.update({
      where: { id },
      data: updateFacultyDto,
    });

    // Log the action
    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'faculty',
      targetId: id,
      details: {
        before: faculty,
        after: updated,
        changedFields: Object.keys(updateFacultyDto),
      },
    });

    return updated;
  }

  async delete(id: number, admin: any) {
    const faculty = await this.findOne(id);
    const deleted = await this.prisma.faculty.delete({
      where: { id },
    });

    // Log the action
    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'faculty',
      targetId: id,
      details: { deletedRecord: faculty },
    });

    return deleted;
  }
}
