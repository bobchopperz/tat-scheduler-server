import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TatService } from './tat.service';

@Injectable()
export class TatScheduler {
  private readonly logger = new Logger(TatScheduler.name);

  constructor(private readonly tatService: TatService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  handleCron() {
    this.tatService.checkAndNotifyRecords();
  }
}