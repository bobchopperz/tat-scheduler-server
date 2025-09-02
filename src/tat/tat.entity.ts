import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Enum untuk status notifikasi agar kode lebih aman dan mudah dibaca
export enum NotificationStatus {
  NOT_SENT = 'NOT_SENT',
  WARNING_SENT = 'WARNING_SENT',
  EXPIRED_SENT = 'EXPIRED_SENT',
}

@Entity('tat_list') // Nama tabel di database
export class TatList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sample_time', type: 'timestamp' })
  sampleTime: Date;

  // Kolom ini krusial untuk memastikan notifikasi hanya dikirim sekali.
  @Column({
    name: 'notification_status',
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.NOT_SENT,
  })
  notificationStatus: NotificationStatus;
}