import {
  Controller,
  ForbiddenException,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ProtectedDocsService } from './protected-docs.service';
import { getRequestIpAddress } from '../common/request-context';

/**
 * Read-only routes for documents that are shown but never handed over.
 *
 * No auth guard, deliberately: NBA reviewers are given a URL and are not going
 * to be issued accounts. The protection is that there is no document here to
 * take - only a page picture, stamped with who asked for it.
 */
@ApiTags('protected-docs')
@Controller('protected-docs')
export class ProtectedDocsController {
  constructor(private readonly docs: ProtectedDocsService) {}

  @Get(':id/meta')
  meta(@Param('id', ParseIntPipe) id: number) {
    return this.docs.meta(id);
  }

  @Get(':id/page/:page')
  @Header('Content-Type', 'image/jpeg')
  // Never cached anywhere but the asking browser, and only for a moment: the
  // image carries that viewer's own watermark, so a shared cache would hand
  // one reader's stamp to the next.
  @Header('Cache-Control', 'private, max-age=60, no-transform')
  @Header('Content-Disposition', 'inline')
  @Header('X-Robots-Tag', 'noindex, noimageindex, noarchive')
  async page(
    @Param('id', ParseIntPipe) id: number,
    @Param('page', ParseIntPipe) page: number,
    @Query('t') token: string | undefined,
    @Res() res: Response,
  ) {
    // The permit comes from /meta and lasts fifteen minutes. Without it these
    // URLs would be permanent and walkable by id - a worse position than the
    // PDF link this replaced.
    if (!this.docs.verifyToken(id, token)) {
      throw new ForbiddenException('This document link has expired. Reopen the document.');
    }

    const stamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
    const viewer = `K.S.R.M. · ${getRequestIpAddress() ?? 'unknown'} · ${stamp} IST`;

    const image = await this.docs.page(id, page, viewer);
    res.end(image);
  }
}
