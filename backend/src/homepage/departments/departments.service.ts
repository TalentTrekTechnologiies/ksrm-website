import { Injectable } from '@nestjs/common';
import { ContentCardService } from '../content-cards/content-card.service';
import {
  CreateDepartmentCardDto,
  DepartmentCardSection,
} from './dto/create-department-card.dto';
import { UpdateDepartmentCardDto } from './dto/update-department-card.dto';
import { ReorderDepartmentCardsDto } from './dto/reorder-department-cards.dto';
import { RequestAdmin } from '../types';

const AUDIT_MODULE = 'homepage_departments';
const ENTITY_LABEL = 'Department card';

/** Thin wrapper over ContentCardService - see quick-links.service.ts / admission-programs.service.ts for the identical pattern. */
@Injectable()
export class DepartmentsService {
  constructor(private contentCards: ContentCardService) {}

  findAllPublic(section: DepartmentCardSection) {
    return this.contentCards.findAllPublic(section);
  }

  findAllAdmin(section?: DepartmentCardSection, includeDeleted = false) {
    return this.contentCards.findAllAdmin(section, includeDeleted);
  }

  create(
    dto: CreateDepartmentCardDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    return this.contentCards.create(
      dto,
      admin,
      AUDIT_MODULE,
      ENTITY_LABEL,
      requestId,
    );
  }

  update(
    id: number,
    dto: UpdateDepartmentCardDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    return this.contentCards.update(
      id,
      dto,
      admin,
      AUDIT_MODULE,
      ENTITY_LABEL,
      requestId,
    );
  }

  softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.softDelete(
      id,
      admin,
      AUDIT_MODULE,
      ENTITY_LABEL,
      requestId,
    );
  }

  restore(id: number, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.restore(
      id,
      admin,
      AUDIT_MODULE,
      ENTITY_LABEL,
      requestId,
    );
  }

  reorder(
    dto: ReorderDepartmentCardsDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    return this.contentCards.reorder(
      dto,
      admin,
      AUDIT_MODULE,
      ENTITY_LABEL,
      requestId,
    );
  }
}
