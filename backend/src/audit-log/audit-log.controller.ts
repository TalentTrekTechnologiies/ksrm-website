import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { AuditLogService } from "./audit-log.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

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
      throw new Error("Only super admins can view audit logs");
    }

    return this.auditLogService.getAll({
      module,
      adminId: adminId ? parseInt(adminId) : undefined,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Get("admin/:adminId")
  @UseGuards(JwtAuthGuard)
  async getByAdminId(@Query("limit") limit?: string, @Request() req?) {
    if (!req.user.isSuperAdmin) {
      throw new Error("Only super admins can view audit logs");
    }

    return this.auditLogService.getByAdminId(
      req.user.id,
      limit ? parseInt(limit) : 50,
    );
  }

  @Get("module/:module")
  @UseGuards(JwtAuthGuard)
  async getByModule(
    @Query("limit") limit?: string,
    @Request() req?,
  ) {
    if (!req.user.isSuperAdmin) {
      throw new Error("Only super admins can view audit logs");
    }

    return this.auditLogService.getByModule(
      req.params.module,
      limit ? parseInt(limit) : 100,
    );
  }
}
