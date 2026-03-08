import { ID } from '@/common/types/common.type';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { assert } from 'console';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { LessThan, Repository } from 'typeorm';
import { AuditLogResDto } from './dto/audit-log.res.dto';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async findAll(query: PaginateQuery): Promise<Paginated<AuditLogResDto>> {
    const result = await paginate(query, this.auditLogRepository, {
      sortableColumns: ['id', 'createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        createdAt: [FilterOperator.GTE, FilterOperator.LTE],
        action: [FilterOperator.IN],
        entity: [FilterOperator.ILIKE],
        entityId: [FilterOperator.ILIKE],
        userId: [FilterOperator.EQ],
      },
    });

    return {
      ...result,
      data: plainToInstance(AuditLogResDto, result.data, {
        excludeExtraneousValues: true,
      }),
    } as Paginated<AuditLogResDto>;
  }

  async findOne(id: ID): Promise<AuditLogResDto> {
    assert(id, 'id is required');
    const log = await this.auditLogRepository.findOneByOrFail({ id });

    return plainToInstance(AuditLogResDto, log);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async purgeAuditLogsOlderThan7Days() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.auditLogRepository.delete({ createdAt: LessThan(sevenDaysAgo) });
  }
}
