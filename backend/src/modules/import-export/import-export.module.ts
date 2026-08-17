import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ImportExportController } from './import-export.controller';
import { ImportService } from './import.service';
import { ExportService } from './export.service';

@Module({
  imports: [AuthModule],
  controllers: [ImportExportController],
  providers: [ImportService, ExportService],
  exports: [ImportService, ExportService],
})
export class ImportExportModule {}
