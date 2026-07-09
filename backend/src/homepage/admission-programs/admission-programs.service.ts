import { Injectable } from '@nestjs/common';
import { ContentCardService } from '../content-cards/content-card.service';
import {
  CreateAdmissionProgramDto,
  AdmissionProgramSection,
} from './dto/create-admission-program.dto';
import { UpdateAdmissionProgramDto } from './dto/update-admission-program.dto';
import { ReorderAdmissionProgramsDto } from './dto/reorder-admission-programs.dto';
import { RequestAdmin } from '../types';

const AUDIT_MODULE = 'homepage_admission_programs';
const ENTITY_LABEL = 'Admission program';

/** Thin wrapper over ContentCardService - see quick-links.service.ts for the identical pattern. */
@Injectable()
export class AdmissionProgramsService {
  constructor(private contentCards: ContentCardService) {}

  findAllPublic(section: AdmissionProgramSection) {
    return this.contentCards.findAllPublic(section);
  }

  findAllAdmin(section?: AdmissionProgramSection, includeDeleted = false) {
    return this.contentCards.findAllAdmin(section, includeDeleted);
  }

  create(dto: CreateAdmissionProgramDto, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.create(dto, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  update(id: number, dto: UpdateAdmissionProgramDto, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.update(id, dto, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.softDelete(id, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  restore(id: number, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.restore(id, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }

  reorder(dto: ReorderAdmissionProgramsDto, admin: RequestAdmin, requestId?: string) {
    return this.contentCards.reorder(dto, admin, AUDIT_MODULE, ENTITY_LABEL, requestId);
  }
}
