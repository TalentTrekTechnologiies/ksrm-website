import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ProtectedDocsController } from './protected-docs.controller';
import { ProtectedDocsService } from './protected-docs.service';

@Module({
  imports: [MediaModule],
  controllers: [ProtectedDocsController],
  providers: [ProtectedDocsService],
  // For Downloads, which starts the render when a document is uploaded.
  exports: [ProtectedDocsService],
})
export class ProtectedDocsModule {}
