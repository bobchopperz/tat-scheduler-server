import { Controller, Get, Logger } from '@nestjs/common';
import { TatList } from './tat.entity';
import { TatService } from './tat.service';

@Controller('tat')
export class TatController {
  private readonly logger = new Logger(TatController.name);

  constructor(private readonly tatService: TatService) {}

  @Get()
  async getAllTatRecords(): Promise<TatList[]> {
    this.logger.log('Request diterima: GET /tat');
    return this.tatService.findAllDescending();
  }
}