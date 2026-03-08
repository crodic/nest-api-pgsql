import { ID } from '@/common/types/common.type';
import { Injectable, NotFoundException } from '@nestjs/common';
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
import { AdminUserEntity } from '../admin-user/entities/admin-user.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AuditLogResDto } from './dto/audit-log.res.dto';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async findAll(query: PaginateQuery): Promise<Paginated<AuditLogResDto>> {
    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndMapOne(
        'log.admin',
        AdminUserEntity,
        'admin_user',
        'admin_user.id = log.userId AND log.userType = :adminType',
        { adminType: AdminUserEntity.name },
      )
      .leftJoinAndMapOne(
        'log.user',
        UserEntity,
        'user',
        'user.id = log.userId AND log.userType = :userType',
        { userType: UserEntity.name },
      )
      .addSelect([
        'admin_user.id',
        'admin_user.email',
        'admin_user.full_name',
        'user.id',
        'user.email',
        'user.full_name',
      ]);

    const result = await paginate(query, qb, {
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

    result.data = result.data.map((log: any) => ({
      ...log,
      user: log.admin ?? log.user,
    }));

    return {
      ...result,
      data: plainToInstance(AuditLogResDto, result.data, {
        excludeExtraneousValues: true,
      }),
    } as Paginated<AuditLogResDto>;
  }

  async findOne(id: ID): Promise<AuditLogResDto> {
    assert(id, 'id is required');
    const log: AuditLogEntity & { admin?: AdminUserEntity; user?: UserEntity } =
      await this.auditLogRepository
        .createQueryBuilder('log')
        .leftJoinAndMapOne(
          'log.admin',
          AdminUserEntity,
          'admin_user',
          'admin_user.id = log.userId AND log.userType = :adminType',
          { adminType: AdminUserEntity.name },
        )
        .leftJoinAndMapOne(
          'log.user',
          UserEntity,
          'user',
          'user.id = log.userId AND log.userType = :userType',
          { userType: UserEntity.name },
        )
        .where('log.id = :id', { id })
        .getOne();

    if (!log) {
      throw new NotFoundException('Activity log not found');
    }

    const result = {
      ...log,
      user: log.admin ?? log.user,
    };

    return plainToInstance(AuditLogResDto, result);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async purgeAuditLogsOlderThan7Days() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.auditLogRepository.delete({ createdAt: LessThan(sevenDaysAgo) });
  }
}
