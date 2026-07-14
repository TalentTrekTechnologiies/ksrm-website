import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

// No version field - roles are managed exclusively by super admins through
// a low-traffic screen; the last-write-wins tradeoff every other
// optimistic-locked module avoids isn't a real risk here.
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
