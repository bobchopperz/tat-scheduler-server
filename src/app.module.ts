// src/app.module.ts (Contoh, sesuaikan dengan file modul utama Anda)

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
// Impor modul-modul Anda yang lain di sini

@Module({
    imports: [
        // 1. Muat dan parsing file .env. isGlobal: true membuatnya tersedia di semua modul.
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // 2. Konfigurasi TypeORM secara asinkron menggunakan ConfigService
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_DATABASE'),

                autoLoadEntities : true,
                synchronize: true, // selama development untuk membuat auto=create table
            }),
        }),

        ScheduleModule.forRoot(),
        // ...tambahkan modul Anda yang lain di sini
    ],
    controllers: [], // Tambahkan controller Anda
    providers: [],   // Tambahkan provider Anda
})
export class AppModule {}