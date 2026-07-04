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
}
