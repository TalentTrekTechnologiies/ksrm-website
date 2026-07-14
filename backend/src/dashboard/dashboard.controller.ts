import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { DashboardOverviewResponseDto } from './dto/dashboard-overview.dto';
import { RecentActivityResponseDto } from './dto/recent-activity.dto';
import { PendingApprovalsResponseDto } from './dto/pending-approvals.dto';
import { StorageResponseDto } from './dto/storage.dto';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOkResponse({ type: DashboardOverviewResponseDto })
  getOverview(
    @Request() req: { user: { id: number; isSuperAdmin: boolean } },
  ): Promise<DashboardOverviewResponseDto> {
    return this.dashboardService.getOverview(req.user);
  }

  @Get('recent-activity')
  @ApiOkResponse({ type: RecentActivityResponseDto })
  getRecentActivity(
    @Request() req: { user: { id: number; isSuperAdmin: boolean } },
    @Query('limit') limit?: string,
  ): Promise<RecentActivityResponseDto> {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.dashboardService.getRecentActivity(
      req.user,
      parsedLimit && !isNaN(parsedLimit) ? parsedLimit : undefined,
    );
  }

  @Get('pending-approvals')
  @ApiOkResponse({ type: PendingApprovalsResponseDto })
  getPendingApprovals(): PendingApprovalsResponseDto {
    return this.dashboardService.getPendingApprovals();
  }

  @Get('storage')
  @ApiOkResponse({ type: StorageResponseDto })
  getStorage(): Promise<StorageResponseDto> {
    return this.dashboardService.getStorage();
  }
}
