import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TatModule } from './tat/tat.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    // 1. Aktifkan scheduler di seluruh aplikasi
    ScheduleModule.forRoot(),

    // 2. Muat konfigurasi dari file YAML menggunakan loader yang kita buat
    ConfigModule.forRoot({
      isGlobal: true, // Membuat ConfigService tersedia di semua modul
      load: [configuration],
    }),

    // 3. Konfigurasi database secara dinamis menggunakan ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Impor ConfigModule agar ConfigService bisa di-inject
      useFactory: (configService: ConfigService) => ({
        type: configService.get<any>('database.type'),
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: false, // Di produksi, selalu set ke false. Gunakan migration.
      }),
      inject: [ConfigService], // Inject ConfigService ke dalam factory
    }),

    // 4. Impor modul khusus kita untuk logika TAT
    TatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
