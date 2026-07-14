import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AuditLogService } from "./audit-log.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

function assertSuperAdmin(req): void {
  if (!req.user.isSuperAdmin) {
    throw new ForbiddenException("Only super admins can view audit logs");
  }
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

@ApiTags("audit-logs")
@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Query("module") module?: string,
    @Query("adminId") adminId?: string,
    @Query("action") action?: string,
    @Query("search") search?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Request() req?,
  ) {
    assertSuperAdmin(req);

    return this.auditLogService.getAll({
      module,
      adminId: adminId ? parseInt(adminId) : undefined,
      action,
      search,
      from: parseDate(from),
      to: parseDate(to),
      page: page ? parseInt(page) : undefined,
      pageSize: pageSize ? parseInt(pageSize) : undefined,
    });
  }

  // Same filter set as getAll, but returns a CSV file instead of a paginated
  // JSON page - the "Export" action in the admin UI just links straight to
  // this route.
  @Get("export")
  @UseGuards(JwtAuthGuard)
  async export(
    @Query("module") module?: string,
    @Query("adminId") adminId?: string,
    @Query("action") action?: string,
    @Query("search") search?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Request() req?,
    @Res() res?: Response,
  ) {
    assertSuperAdmin(req);

    const csv = await this.auditLogService.exportCsv({
      module,
      adminId: adminId ? parseInt(adminId) : undefined,
      action,
      search,
      from: parseDate(from),
      to: parseDate(to),
    });

    res!.setHeader("Content-Type", "text/csv");
    res!.setHeader(
      "Content-Disposition",
      `attachment; filename="audit-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res!.send(csv);
  }

  @Get("admin/:adminId")
  @UseGuards(JwtAuthGuard)
  async getByAdminId(
    @Param("adminId", ParseIntPipe) adminId: number,
    @Query("limit") limit?: string,
    @Request() req?,
  ) {
    assertSuperAdmin(req);

    return this.auditLogService.getByAdminId(
      adminId,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get("module/:module")
  @UseGuards(JwtAuthGuard)
  async getByModule(
    @Param("module") module: string,
    @Query("limit") limit?: string,
    @Request() req?,
  ) {
    assertSuperAdmin(req);

    return this.auditLogService.getByModule(
      module,
      limit ? parseInt(limit) : 100,
    );
  }

  // Deliberately NOT super-admin-gated like the three routes above - this
  // is scoped to one record's history, not the global cross-module log,
  // and the caller already needed `<module>.view` to reach whatever admin
  // page's "Audit History" button links here. See AuditLogService.getByTarget.
  @Get("target")
  @UseGuards(JwtAuthGuard)
  async getByTarget(
    @Query("module") module: string,
    @Query("targetId", ParseIntPipe) targetId: number,
    @Query("limit") limit?: string,
  ) {
    return this.auditLogService.getByTarget(
      module,
      targetId,
      limit ? parseInt(limit) : 50,
    );
  }

  // Same non-super-admin-gated reasoning as getByTarget above - backs
  // CmsRecordMeta's Created By/Updated By line.
  @Get("target/creator-updater")
  @UseGuards(JwtAuthGuard)
  async getCreatorAndUpdater(
    @Query("module") module: string,
    @Query("targetId", ParseIntPipe) targetId: number,
  ) {
    return this.auditLogService.getCreatorAndUpdater(module, targetId);
  }
}
