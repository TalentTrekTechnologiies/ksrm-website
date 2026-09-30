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

  /**
   * Where the figures are on a page, so the viewer can block them out.
   *
   * Behind the same expiring token as the page image: the boxes say where the
   * numbers are, and handing that to anyone who asks would help an attacker
   * aim rather than hinder them.
   *
   * Positions only, never values. The figures stay in the page pixels.
   */
  @Get(':id/figures/:page')
  @Header('Cache-Control', 'private, max-age=60')
  @Header('X-Robots-Tag', 'noindex, noarchive')
  figures(
    @Param('id', ParseIntPipe) id: number,
    @Param('page', ParseIntPipe) page: number,
    @Query('t') token: string | undefined,
  ) {
    if (!this.docs.verifyToken(id, token)) {
      throw new ForbiddenException(
        'This document link has expired. Reopen the document.',
      );
    }
    return this.docs.figures(id, page);
  }

  @Get(':id/page/:page')
  @Header('Content-Type', 'image/jpeg')
  // Never cached anywhere but the asking browser, and only for a moment: the
  // link behind it expires, and a shared cache would keep serving the page
  // after it had.
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
      throw new ForbiddenException(
        'This document link has expired. Reopen the document.',
      );
    }

    const image = await this.docs.page(id, page);
    res.end(image);
  }
}
