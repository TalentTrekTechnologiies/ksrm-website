import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuditLogService } from "./audit-log.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("audit-logs")
@Controller("audit-logs")
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(
    @Query("module") module?: string,
    @Query("adminId") adminId?: string,
    @Query("limit") limit?: string,
    @Request() req?,
  ) {
    // Only super admin can view audit logs
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException("Only super admins can view audit logs");
    }

    return this.auditLogService.getAll({
      module,
      adminId: adminId ? parseInt(adminId) : undefined,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Get("admin/:adminId")
  @UseGuards(JwtAuthGuard)
  async getByAdminId(
    @Param("adminId", ParseIntPipe) adminId: number,
    @Query("limit") limit?: string,
    @Request() req?,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException("Only super admins can view audit logs");
    }

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
    if (!req.user.isSuperAdmin) {
      throw new ForbiddenException("Only super admins can view audit logs");
    }

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
