import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TatList } from './tat.entity';
import { TatScheduler } from './tat.scheduler';
import { TatService } from './tat.service';
import { HttpModule } from '@nestjs/axios';
import { TatController } from './tat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TatList]), // Membuat repository TatList tersedia
    HttpModule, // Impor HttpModule agar HttpService bisa di-inject
  ],
  controllers: [TatController], // Tambahkan controller untuk endpoint API
  providers: [TatService, TatScheduler],
})
export class TatModule {}