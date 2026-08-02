import { Module } from '@nestjs/common';
import { ContentVersionController } from './content-version.controller';

@Module({
  controllers: [ContentVersionController],
})
export class ContentVersionModule {}
