import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AuditLogModule, MediaModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
