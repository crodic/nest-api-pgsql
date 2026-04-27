import { AutoIncrementID } from '@/common/types/common.type';
import { CacheKey } from '@/constants/cache.constant';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { assert } from 'console';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { EntityManager, Repository } from 'typeorm';
import { CreateRoleReqDto } from './dto/create-role.req.dto';
import { RoleResDto } from './dto/role.res.dto';
import { UpdateRoleReqDto } from './dto/update-role.req.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findAll(query: PaginateQuery): Promise<Paginated<RoleResDto>> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    const result = await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
      searchableColumns: ['name', 'description'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        name: [FilterOperator.ILIKE],
      },
    });

    return {
      ...result,
      data: plainToInstance(RoleResDto, result.data, {
        excludeExtraneousValues: true,
      }),
    } as Paginated<RoleResDto>;
  }

  async hasRole(): Promise<boolean> {
    const cacheKey = CacheKey.SYSTEM_HAS_ROLE;
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    console.log('Cache store type:', this.cacheManager.constructor.name);

    if (cached !== undefined) {
      return cached;
    }

    const count = await this.roleRepository.count();
    const hasRole = count > 0;

    await this.cacheManager.set(cacheKey, hasRole, 60_000);

    return hasRole;
  }

  async createWithManager(
    manager: EntityManager,
    data: CreateRoleReqDto,
  ): Promise<RoleEntity> {
    const repo = manager.getRepository(RoleEntity);
    const role = await repo.save(repo.create(data));
    this.cacheManager.del(CacheKey.SYSTEM_HAS_ROLE);

    return role;
  }

  async create(dto: CreateRoleReqDto): Promise<RoleResDto> {
    const newRole = new RoleEntity({
      ...dto,
    });

    const savedRole = await this.roleRepository.save(newRole);

    // this.logger.debug(savedRole);

    return plainToInstance(RoleResDto, savedRole);
  }

  async formOptions(): Promise<RoleResDto[]> {
    const query = await this.roleRepository.find();

    console.log(query);

    return plainToInstance(RoleResDto, query, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: AutoIncrementID): Promise<RoleResDto> {
    assert(id, 'id is required');
    const role = await this.roleRepository.findOneByOrFail({ id });
    return role.toDto(RoleResDto);
  }

  async update(id: AutoIncrementID, updateRoleDto: UpdateRoleReqDto) {
    const role = await this.roleRepository.findOneByOrFail({ id });

    role.name = updateRoleDto.name;
    role.description = updateRoleDto.description;
    role.permissions = updateRoleDto.permissions;

    await this.roleRepository.save(role);
  }

  async remove(id: AutoIncrementID) {
    const role = await this.roleRepository.findOneByOrFail({ id });
    await this.roleRepository.softRemove(role);
  }
}
