import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ProtectedDocsController } from './protected-docs.controller';
import { ProtectedDocsService } from './protected-docs.service';

@Module({
  imports: [MediaModule],
  controllers: [ProtectedDocsController],
  providers: [ProtectedDocsService],
})
export class ProtectedDocsModule {}
