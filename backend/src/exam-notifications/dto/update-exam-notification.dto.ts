import { PartialType } from '@nestjs/swagger';
import { CreateExamNotificationDto } from './create-exam-notification.dto';

// No version field - this module has no soft-delete/optimistic-lock
// columns by design (same "intentionally simple" reasoning as Research).
export class UpdateExamNotificationDto extends PartialType(
  CreateExamNotificationDto,
) {}
