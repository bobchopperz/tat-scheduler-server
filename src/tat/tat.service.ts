import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Between, LessThan, Not, Repository } from 'typeorm';
import { NotificationStatus, TatList } from './tat.entity';

@Injectable()
export class TatService {
  // Membuat logger khusus untuk service ini agar log lebih mudah dilacak
  private readonly logger = new Logger(TatService.name);
  private readonly webhookUrl: string;

  constructor(
    @InjectRepository(TatList)
    private readonly tatRepository: Repository<TatList>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Ambil URL webhook dari konfigurasi saat service diinisialisasi
    this.webhookUrl = this.configService.get<string>('webhook.url');
    if (!this.webhookUrl) {
      this.logger.warn(
        'URL Webhook tidak ditemukan di dbconfig.yml. Notifikasi tidak akan dikirim.',
      );
    }
  }

  /**
   * Mengambil semua data TAT, diurutkan dari yang terbaru.
   * Digunakan oleh Controller untuk ditampilkan di frontend.
   */
  async findAllDescending(): Promise<TatList[]> {
    return this.tatRepository.find({
      order: {
        sampleTime: 'DESC',
      },
    });
  }

  /**
   * Logika utama yang dijalankan oleh scheduler setiap menit.
   */
  async checkAndNotifyRecords() {
    this.logger.log('Scheduler berjalan: Memeriksa data TAT...');
    await this.processWarningRecords();
    await this.processExpiredRecords();
  }

  /**
   * Mencari data yang masuk rentang 'WARNING' (114-120 menit)
   * dan belum pernah dikirimi notifikasi.
   */
  private async processWarningRecords() {
    const now = Date.now();
    const warningUpperBoundary = new Date(now - 114 * 60 * 1000);
    const warningLowerBoundary = new Date(now - 120 * 60 * 1000);

    const recordsToWarn = await this.tatRepository.find({
      where: {
        sampleTime: Between(warningLowerBoundary, warningUpperBoundary),
        notificationStatus: NotificationStatus.NOT_SENT,
      },
    });

    for (const record of recordsToWarn) {
      const success = await this.sendWebhook(record.id, 'WARNING');
      if (success) {
        await this.tatRepository.update(record.id, {
          notificationStatus: NotificationStatus.WARNING_SENT,
        });
        this.logger.log(
          `Record ID ${record.id}: Notifikasi WARNING terkirim & status diupdate.`,
        );
      }
    }
  }

  /**
   * Mencari data yang masuk kategori 'EXPIRED' (>120 menit)
   * dan status notifikasinya BUKAN 'EXPIRED_SENT'.
   */
  private async processExpiredRecords() {
    const now = Date.now();
    const expiredBoundary = new Date(now - 120 * 60 * 1000);

    const recordsToExpire = await this.tatRepository.find({
      where: {
        sampleTime: LessThan(expiredBoundary),
        notificationStatus: Not(NotificationStatus.EXPIRED_SENT),
      },
    });

    for (const record of recordsToExpire) {
      const success = await this.sendWebhook(record.id, 'EXPIRED');
      if (success) {
        await this.tatRepository.update(record.id, {
          notificationStatus: NotificationStatus.EXPIRED_SENT,
        });
        this.logger.log(
          `Record ID ${record.id}: Notifikasi EXPIRED terkirim & status diupdate.`,
        );
      }
    }
  }

  private async sendWebhook(
    recordId: number,
    status: 'WARNING' | 'EXPIRED',
  ): Promise<boolean> {
    if (!this.webhookUrl) return false;

    const payload = { id: recordId, status };
    this.logger.log(`Mengirim webhook: ${JSON.stringify(payload)}`);

    try {
      await firstValueFrom(this.httpService.post(this.webhookUrl, payload));
      return true;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Gagal mengirim webhook untuk record ID ${recordId}: ${axiosError.message}`,
      );
      return false;
    }
  }
}