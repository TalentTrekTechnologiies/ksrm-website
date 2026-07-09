import { Injectable } from '@nestjs/common';
import { ContentCardService } from '../content-cards/content-card.service';
import { CreateQuickLinkDto, QuickLinkSection } from './dto/create-quick-link.dto';
import { UpdateQuickLinkDto } from './dto/update-quick-link.dto';
import { ReorderQuickLinksDto } from './dto/reorder-quick-links.dto';
import { RequestAdmin } from '../types';

const AUDIT_MODULE = 'homepage_quick_links';
const ENTITY_LABEL = 'Quick link';

/**
 * Thin wrapper over the generic ContentCardService, fixing the audit
 * module/entity label so Quick Links' behavior and public routes
 * (/homepage/quick-links, /homepage/admin/quick-links/...) are byte-for-byte
 * unchanged from Sprint 1A - only the CRUD logic itself moved to a shared
 * service (see content-cards/content-card.service.ts's doc comment).
 */
@Injectable()
export class QuickLinksService {
  constructor(private contentCards: ContentCardService) {}

  findAllPublic(section: QuickLinkSection) {
    return this.contentCards.findAllPublic(section);
  }

  findAllAdmin(section?: QuickLinkSection, includeDeleted = false) {
    return this.contentCards.findAllAdmin(section, includeDeleted);
  }

  create(dto: CreateQuickLinkDto, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.create(dto, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  update(id: number, dto: UpdateQuickLinkDto, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.update(id, dto, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.softDelete(id, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  restore(id: number, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.restore(id, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  reorder(dto: ReorderQuickLinksDto, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.reorder(dto, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }
}
