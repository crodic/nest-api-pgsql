import { ID } from '@/common/types/common.type';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { CacheKey } from '@/constants/cache.constant';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@/exceptions/validation.exception';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';
import { ClsService } from 'nestjs-cls';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { EntityManager, Repository } from 'typeorm';
import { RoleEntity } from '../role/entities/role.entity';
import { SettingsService } from '../settings/settings.service';
import { AdminUserResDto } from './dto/admin-user.res.dto';
import { CreateAdminUserReqDto } from './dto/create-admin-user.req.dto';
import { UpdateAdminUserReqDto } from './dto/update-admin-user.req.dto';
import { AdminUserEntity } from './entities/admin-user.entity';

@Injectable()
export class AdminUserService {
  private readonly logger = new Logger(AdminUserService.name);

  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminUserRepository: Repository<AdminUserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private cls: ClsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly settingsService: SettingsService,
  ) {}

  async hasAdmin(): Promise<boolean> {
    const cacheKey = CacheKey.SYSTEM_HAS_ADMIN;
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    if (cached !== undefined) {
      return cached;
    }
    const count = await this.adminUserRepository.count();
    const hasAdmin = count > 0;

    await this.cacheManager.set(cacheKey, hasAdmin, 60_000);

    return hasAdmin;
  }

  async createWithManager(manager: EntityManager, data: CreateAdminUserReqDto) {
    const repo = manager.getRepository(AdminUserEntity);
    const adminUser = await repo.save(repo.create(data));
    this.cacheManager.del(CacheKey.SYSTEM_HAS_ADMIN);

    return adminUser;
  }

  async create(dto: CreateAdminUserReqDto): Promise<AdminUserResDto> {
    const {
      email,
      password,
      bio,
      firstname,
      lastname,
      roleId,
      birthday,
      phone,
    } = dto;

    const user = await this.adminUserRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      throw new ValidationException(ErrorCode.E001);
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      throw new ValidationException(ErrorCode.E002);
    }

    const newUser = new AdminUserEntity({
      firstname,
      lastname,
      email,
      password,
      bio,
      role,
      birthday: birthday ? new Date(birthday) : null,
      phone,
      createdBy: this.cls.get('userId') || SYSTEM_USER_ID,
      updatedBy: this.cls.get('userId') || SYSTEM_USER_ID,
    });

    const savedUser = await this.adminUserRepository.save(newUser);

    return plainToInstance(AdminUserResDto, savedUser);
  }

  async findAllUser(query: PaginateQuery): Promise<Paginated<AdminUserResDto>> {
    const queryBuilder = this.adminUserRepository.createQueryBuilder('admin');

    const result = await paginate(query, queryBuilder, {
      sortableColumns: ['id', 'email', 'createdAt', 'updatedAt'],
      searchableColumns: ['email'],
      defaultSortBy: [['id', 'DESC']],
      filterableColumns: {
        'role.id': [FilterOperator.IN],
        email: [FilterOperator.ILIKE],
        fullname: [FilterOperator.ILIKE],
        createdAt: [FilterOperator.GTE, FilterOperator.LTE, FilterOperator.BTW],
      },
      relations: ['role'],
    });

    return {
      ...result,
      data: plainToInstance(AdminUserResDto, result.data, {
        excludeExtraneousValues: true,
      }),
    } as Paginated<AdminUserResDto>;
  }

  async findOne(id: ID): Promise<AdminUserResDto> {
    assert(id, 'id is required');
    const user = await this.adminUserRepository.findOneByOrFail({ id });

    return user.toDto(AdminUserResDto);
  }

  async update(id: ID, updateUserDto: UpdateAdminUserReqDto) {
    const user = await this.adminUserRepository.findOneByOrFail({ id });
    const updatedRole = await this.roleRepository.findOneBy({
      id: updateUserDto.roleId,
    });

    Object.assign(user, updateUserDto);

    delete user.password;
    user.role = updatedRole;

    user.updatedBy = this.cls.get('userId') || SYSTEM_USER_ID;

    await this.adminUserRepository.save(user);
  }

  async remove(id: ID) {
    const admin = await this.adminUserRepository.findOneByOrFail({ id });
    await this.adminUserRepository.softRemove(admin);
  }
}
