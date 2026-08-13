import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  ContentStyleItemDto,
  UpsertContentStylesDto,
} from './dto/content-style.dto';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'content_styles';

/**
 * Size and colour for a field of any CMS record.
 *
 * Rows are addressed by (module, recordId, field) with no foreign key, so this
 * service never needs to know what a "news" or a "gallery" is, and no module
 * has to be changed to gain the feature - it only has to render through
 * StyledText and offer the control in its form.
 */
@Injectable()
export class ContentStylesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /**
   * Every style for one module, or for all of them.
   *
   * Whole-module rather than per-record: a page listing forty news items would
   * otherwise make forty requests, and the rows are tiny.
   */
  findAllPublic(module?: string) {
    return this.prisma.contentStyle.findMany({
      where: module ? { module } : {},
      orderBy: [{ module: 'asc' }, { recordId: 'asc' }],
    });
  }

  /**
   * A style with neither size nor colour is deleted rather than stored blank -
   * "no styling" is the absence of a row, so clearing one leaves nothing
   * behind for the next reader to interpret.
   */
  async upsert(
    dto: UpsertContentStylesDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const written: ContentStyleItemDto[] = [];

    for (const item of dto.items) {
      const key = {
        module_recordId_field: {
          module: item.module,
          recordId: item.recordId,
          field: item.field,
        },
      };
      const fontSize = item.fontSize?.trim() || null;
      const color = item.color?.trim() || null;

      if (!fontSize && !color) {
        await this.prisma.contentStyle.deleteMany({
          where: {
            module: item.module,
            recordId: item.recordId,
            field: item.field,
          },
        });
        continue;
      }

      await this.prisma.contentStyle.upsert({
        where: key,
        create: { ...item, fontSize, color, updatedBy: admin.id },
        update: { fontSize, color, updatedBy: admin.id },
      });
      written.push(item);
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      details: { items: dto.items },
      requestId,
    });

    return this.findAllPublic();
  }
}
